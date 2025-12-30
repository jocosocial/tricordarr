//
//  Notifications.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/2/25.
//

import Foundation
import NetworkExtension
import UIKit
import UserNotifications

/// Class to manage User Notifications.
///
/// A lot of this came from https://github.com/challfry/TheKraken/blob/master/Kraken/Core/Notifications.swift
///
/// The Kraken implementation has a `processNotifications(_)` function that reloads data from the API if certain notifications are showing.
/// Tricordarr does not need this since any data refetches are handled by React Query and/or the NotificationDataPoller/NotificationDataListener
/// components on the JavaScript side.
@objc public class Notifications: NSObject, UNUserNotificationCenterDelegate {
	/// Serial queue for thread-safe access to the shared instance
	private static let accessQueue = DispatchQueue(label: "com.grantcohoe.tricordarr.notifications.access")

	/// Private shared instance
	/// Synchronization is handled via accessQueue
	nonisolated(unsafe) private static let _shared = Notifications()

	/// Thread-safe access to the shared Notifications instance
	public static var shared: Notifications {
		return accessQueue.sync {
			return _shared
		}
	}

	/// The pushManager is the instance that handles the local push provider.
	@objc dynamic var backgroundPushManager: NEAppPushManager?
	/// InApp runs when app is foregrounded and the extension isn't running.
	@objc dynamic var foregroundPushProvider = WebsocketNotifier(isInApp: true)
	/// This timer is used in various places to determine if the foregroundPushProvider should be started.
	private var providerDownTimer: Timer?
	/// Logger for this class
	private let logger = Logging.getLogger("Notifications")
	/// Track if appStarted has been called to avoid multiple initializations
	private var hasAppStarted = false

	/**
	 Initialize the push manager system. Called once from setupLocalPushManager to set up observers.
	 Loads existing managers from preferences and sets up lifecycle observers.
	 */
	@objc static func appStarted() {
		let instance = Notifications.shared
		guard !instance.hasAppStarted else {
			instance.logger.log("[Notifications.swift] appStarted() already called, skipping")
			return
		}
		instance.logger.log("[Notifications.swift] appStarted() called - initializing push manager system")
		instance.hasAppStarted = true

		#if !targetEnvironment(simulator)
			instance.logger.log("[Notifications.swift] Loading existing push managers from preferences")
			NEAppPushManager.loadAllFromPreferences { managers, error in
				if let error = error {
					instance.logger.error(
						"[Notifications.swift] Couldn't load push manager prefs: \(error.localizedDescription, privacy: .public)"
					)
					return
				}
				let manager = managers?.first
				if let manager = manager {
					instance.logger.log(
						"[Notifications.swift] Found existing push manager, setting delegate and storing reference"
					)
					// Just set the delegate and manager, saveSettings will be called from setupLocalPushManager
					manager.delegate = instance
					instance.backgroundPushManager = manager
				}
				else {
					instance.logger.log("[Notifications.swift] No existing push manager found in preferences")
				}
			}

			// Set up KVO observer for backgroundPushManager.isActive
			instance.logger.log("[Notifications.swift] Setting up KVO observer for backgroundPushManager.isActive")
			instance.addObserver(
				instance,
				forKeyPath: "backgroundPushManager.isActive",
				options: [.new, .old],
				context: nil
			)

			// If at app launch the extension isn't running, start using in-app provider after a delay
			instance.logger.log(
				"[Notifications.swift] Scheduling 5-second timer to check if in-app socket should start"
			)
			instance.providerDownTimer = Timer.scheduledTimer(withTimeInterval: 5, repeats: false) { timer in
				instance.checkStartInAppSocket()
			}
			instance.logger.log("[Notifications.swift] appStarted() initialization complete")
		#else
			instance.logger.log("[Notifications.swift] appStarted() called in simulator - skipping push manager setup")
		#endif
	}

	/**
	 Handle KVO changes for backgroundPushManager.isActive
	 */
	public override func observeValue(
		forKeyPath keyPath: String?,
		of object: Any?,
		change: [NSKeyValueChangeKey: Any]?,
		context: UnsafeMutableRawPointer?
	) {
		if keyPath == "backgroundPushManager.isActive" {
			if let pm = backgroundPushManager {
				let isActive = pm.isActive
				logger.info("[Notifications.swift] Extension push provider is \(isActive ? "active" : "inactive")")

				// Log the change if available
				if let change = change,
					let oldValue = change[.oldKey] as? Bool,
					let newValue = change[.newKey] as? Bool,
					oldValue != newValue
				{
					logger.log(
						"[Notifications.swift] Background push manager state changed from \(oldValue, privacy: .public) to \(newValue, privacy: .public)"
					)
				}
			}
			else {
				logger.info("[Notifications.swift] Extension push provider is nil.")
			}
			if backgroundPushManager?.isActive == true {
				logger.log(
					"[Notifications.swift] Background push manager is active - stopping in-app socket and canceling timer"
				)
				checkStopInAppSocket()
				providerDownTimer?.invalidate()
				providerDownTimer = nil
			}
			else {
				// Start a 30 second timer. If the provider extension is still offline, enable the
				// in-app provider. This should prevent extra socket cycling for very short Wifi unavailability.
				logger.log(
					"[Notifications.swift] Background push manager is inactive - scheduling 30-second timer to start in-app socket"
				)
				providerDownTimer?.invalidate()
				providerDownTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: false) { timer in
					self.logger.log(
						"[Notifications.swift] 30-second timer fired - checking if in-app socket should start"
					)
					self.checkStartInAppSocket()
				}
			}
		}
		else {
			super.observeValue(forKeyPath: keyPath, of: object, change: change, context: context)
		}
	}

	/**
	 Configure the providers with settings. Called from the JavaScript side over the "bridge".
	 */
	@objc static func saveSettings(socketUrl: String, token: String, enable: Bool) {
		let instance = Notifications.shared
		instance.logger.log(
			"[Notifications.swift] saveSettings() called with socketUrl: \(socketUrl, privacy: .private), enable: \(enable, privacy: .public)"
		)
		instance.saveSettings(socketUrl: socketUrl, token: token, enable: enable)
	}

	/**
	 Internal method to save settings for a specific manager or create a new one.
	 */
	private func saveSettings(socketUrl: String, token: String, enable: Bool) {
		logger.log("[Notifications.swift] saveSettings() instance method called, delegating to saveSettings(for:)")
		saveSettings(for: backgroundPushManager, socketUrl: socketUrl, token: token, enable: enable)
	}

	/**
	 Save settings for the push manager. Configures both background and foreground providers.
	 */
	private func saveSettings(
		for manager: NEAppPushManager?,
		socketUrl: String? = nil,
		token: String? = nil,
		enable: Bool? = nil
	) {
		logger.log(
			"[Notifications.swift] saveSettings(for:) called with manager: \(manager != nil ? "existing" : "nil", privacy: .public), enable: \(enable?.description ?? "nil", privacy: .public)"
		)
		#if !targetEnvironment(simulator)
			// Get configuration from parameters or AppConfig
			let config = AppConfig.shared
			let wifiNetworkNames = config?.wifiNetworkNames ?? []
			logger.log(
				"[Notifications.swift] WiFi network names from config: \(wifiNetworkNames.count, privacy: .public) networks"
			)

			// Build websocket URL from parameter or AppConfig
			var websocketURLComponents: URLComponents?
			if let providedSocketUrl = socketUrl {
				logger.log("[Notifications.swift] Using provided socketUrl parameter")
				websocketURLComponents = URLComponents(string: providedSocketUrl)
			}
			else if let serverUrl = config?.serverUrl, let url = URL(string: serverUrl) {
				logger.log("[Notifications.swift] Using serverUrl from AppConfig")
				websocketURLComponents = URLComponents(url: url, resolvingAgainstBaseURL: false)
			}

			guard var urlComponents = websocketURLComponents else {
				logger.error(
					"[Notifications.swift] Could not build websocket URL from socketUrl parameter or AppConfig.serverUrl"
				)
				return
			}

			// Convert http/https to ws/wss
			let originalScheme = urlComponents.scheme
			if urlComponents.scheme == "https" {
				urlComponents.scheme = "wss"
			}
			else if urlComponents.scheme == "http" {
				urlComponents.scheme = "ws"
			}
			urlComponents.path = "/api/v3/notification/socket"
			logger.log(
				"[Notifications.swift] Converted URL scheme from \(originalScheme ?? "nil", privacy: .public) to \(urlComponents.scheme ?? "nil", privacy: .public)"
			)

			guard let websocketURLString = urlComponents.string else {
				logger.error("[Notifications.swift] Could not build websocket URL string")
				return
			}
			logger.log("[Notifications.swift] Built websocket URL: \(websocketURLString, privacy: .private)")

			guard let authToken = token, !authToken.isEmpty else {
				logger.error("[Notifications.swift] Token is required but not provided")
				return
			}

			guard let shouldEnable = enable else {
				logger.error("[Notifications.swift] Enable parameter is required but not provided")
				return
			}

			// Update foreground provider config
			logger.log("[Notifications.swift] Updating foreground push provider configuration")
			foregroundPushProvider.updateConfig(serverURL: urlComponents.url, token: authToken)

			// Configure background manager
			if !wifiNetworkNames.isEmpty && shouldEnable {
				logger.log(
					"[Notifications.swift] Configuring background push manager (WiFi networks available and enabled)"
				)
				let mgr = manager ?? NEAppPushManager()
				if manager == nil {
					logger.log("[Notifications.swift] Creating new NEAppPushManager instance")
				}
				else {
					logger.log("[Notifications.swift] Using existing NEAppPushManager instance")
				}

				// Check if we need to update the manager
				let needsUpdate =
					websocketURLString != mgr.providerConfiguration["twitarrURL"] as? String
					|| authToken != mgr.providerConfiguration["token"] as? String || mgr.matchSSIDs != wifiNetworkNames
					|| mgr.isEnabled == false

				if needsUpdate {
					logger.log("[Notifications.swift] Push manager configuration changed, updating settings")
					mgr.localizedDescription = "App Extension for Background Server Communication"
					mgr.providerBundleIdentifier = "com.grantcohoe.tricordarr.LocalPushExtension"
					mgr.isEnabled = true
					mgr.providerConfiguration = [
						"twitarrURL": websocketURLString,
						"token": authToken,
					]
					mgr.matchSSIDs = wifiNetworkNames
					logger.log("[Notifications.swift] Saving push manager preferences")

					mgr.saveToPreferences { error in
						if let error = error {
							self.logger.error(
								"[Notifications.swift] Couldn't save push manager prefs: \(error.localizedDescription, privacy: .public)"
							)
							return
						}
						self.logger.log("[Notifications.swift] Successfully saved push manager preferences")
						mgr.loadFromPreferences { error in
							if let error = error {
								self.logger.error(
									"[Notifications.swift] Couldn't load push manager prefs: \(error.localizedDescription, privacy: .public)"
								)
								return
							}
							self.logger.log("[Notifications.swift] Successfully loaded push manager preferences")
						}
					}
				}
				else {
					logger.log("[Notifications.swift] Push manager configuration unchanged, skipping update")
				}
				backgroundPushManager = mgr
				mgr.isEnabled = true
				mgr.delegate = self
				logger.log("[Notifications.swift] Background push manager configured and enabled")
			}
			else if let mgr = manager {
				// Remove manager if disabled or no WiFi networks
				if wifiNetworkNames.isEmpty {
					logger.log("[Notifications.swift] Removing push manager - no WiFi networks configured")
				}
				else {
					logger.log("[Notifications.swift] Removing push manager - notifications disabled")
				}
				mgr.removeFromPreferences { error in
					if let error = error {
						self.logger.error(
							"[Notifications.swift] Couldn't remove push manager prefs: \(error.localizedDescription, privacy: .public)"
						)
						return
					}
					self.logger.log("[Notifications.swift] Successfully removed push manager from preferences")
				}
				backgroundPushManager = nil
			}
			else {
				logger.log("[Notifications.swift] No background push manager to configure or remove")
			}
		#else
			// Simulator: just update foreground provider
			logger.log("[Notifications.swift] saveSettings() called in simulator - updating foreground provider only")
			guard let providedSocketUrl = socketUrl, let providedToken = token else {
				logger.error("[Notifications.swift] socketUrl and token are required")
				return
			}
			if let urlComponents = URLComponents(string: providedSocketUrl) {
				// Convert http/https to ws/wss
				var components = urlComponents
				if components.scheme == "https" {
					components.scheme = "wss"
				}
				else if components.scheme == "http" {
					components.scheme = "ws"
				}
				components.path = "/api/v3/notification/socket"
				logger.log("[Notifications.swift] Updating foreground provider config in simulator")
				foregroundPushProvider.updateConfig(serverURL: components.url, token: providedToken)
			}
			if enable == true {
				logger.log("[Notifications.swift] Enabling in-app socket in simulator")
				checkStartInAppSocket()
			}
		#endif
		logger.log("[Notifications.swift] saveSettings(for:) completed")
	}

	// MARK: - Notification Generation

	/**
	 Generates and posts a local notification containing custom content and metadata.
	 Mostly mirrors what's going on in `src/Libraries/Notifications/Content.ts`.
	 The userInfo (aka "data") payload is arbitrary metadata that is associated with the notification. This payload is read during various
	 app event handlers to trigger certain behavior.
	
	 - Parameters:
	   - id: A unique identifier for the notification. Defaults to a new `UUID()` if not provided.
	   - title: The title text displayed in the notification banner.
	   - body: The body text displayed below the title in the notification.
	   - type: String value of `src/Structs/SocketStructs.ts`.
	   - url: A URL string associated with the content. This is typically used for deep linking.
	   - markAsReadUrl: An optional URL string used to mark the content as read when acted upon.
	 */
	static func generateContentNotification(
		_ id: UUID = UUID(),
		title: String,
		body: String,
		type: NotificationTypeData,
		url: String,
		markAsReadUrl: String? = nil
	) {
		// `userInfo` is the equivant of `data` in Notifee
		let userInfo = UserInfoData(type: type, url: url, markAsReadUrl: markAsReadUrl)

		// Construct the notification payload
		let content = UNMutableNotificationContent()
		content.title = title
		content.body = body
		content.sound = .default
		content.userInfo = userInfo.asDictionary

		// Send it
		let request = UNNotificationRequest(identifier: id.uuidString, content: content, trigger: nil)
		UNUserNotificationCenter.current()
			.add(request) { error in
				if let error = error {
					Logging.logger.log(
						"Error submitting local notification: \(error.localizedDescription, privacy: .public)"
					)
					return
				}

				Logging.logger.log("Local notification posted successfully")
			}
	}

	// MARK: - Notification Handling

	/**
	 Required delegate method to display notifications when app is in foreground. This gets called when a notification is *delivered* while the app is running
	 in the foreground. The completion handler argument lets us choose how to show the notification to the user.
	 Options: .banner (show banner), .sound (play sound), .badge (update badge), .list (add to notification center)
	
	 If it's shown to the user (over our app's UI--we're in the FG) and the user taps it, the
	 `userNotificationCenter(_:didReceive:withCompletionHandler)` below is called instead.
	 */
	public func userNotificationCenter(
		_ center: UNUserNotificationCenter,
		willPresent notification: UNNotification,
		withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
	) {
		completionHandler([.banner, .sound, .badge, .list])
	}

	/**
	 Process displaying notifications as the app comes into the foreground. Often this will do nothing, but if the user has a ton of old
	 notifications then it will clear them out automatically. Called in `AppDelegate.swift`.
	 */
	public static func appForegrounded() {
		let center = UNUserNotificationCenter.current()
		center.getDeliveredNotifications { notifications in
			// Remove older notifications; keep ones that are within 10 minutes of delivery (during this time,
			// people may still be getting to the event the notification is reminding them of).
			let oldNotifications = notifications.compactMap { notification in
				notification.date < Date() - 60 * 10 ? notification.request.identifier : nil
			}

			center.removeDeliveredNotifications(withIdentifiers: oldNotifications)
		}
	}

	/**
	 Called when the user taps a notification, whether the notification is displayed while the app running or not.
	 */
	public func userNotificationCenter(
		_ center: UNUserNotificationCenter,
		didReceive response: UNNotificationResponse,
		withCompletionHandler completionHandler: @escaping () -> Void
	) {
		handleNotificationDeepLink(response)
		completionHandler()
	}

	// MARK: - Foreground Push Provider

	/**
	 At app launch, app fg, or after 30 secs of the app extension being offline, try starting the in-app websocket for notifications.
	 Try to ensure the app extension's socket and our in-app socket are not running at the same time.
	 */
	func checkStartInAppSocket() {
		let backgroundActive = backgroundPushManager?.isActive == true
		let foregroundRunning = foregroundPushProvider.startState == true
		logger.log(
			"[Notifications.swift] checkStartInAppSocket() called - background active: \(backgroundActive, privacy: .public), foreground running: \(foregroundRunning, privacy: .public)"
		)
		if !backgroundActive && !foregroundRunning {
			logger.log("[Notifications.swift] Starting in-app websocket provider")
			foregroundPushProvider.start()
		}
		else {
			if backgroundActive {
				logger.log("[Notifications.swift] Skipping in-app socket start - background push manager is active")
			}
			if foregroundRunning {
				logger.log("[Notifications.swift] Skipping in-app socket start - foreground provider already running")
			}
		}
	}

	/**
	 Attempt to shut down the foreground provider. Usually called when the background manager says the
	 background provider is active.
	 */
	func checkStopInAppSocket() {
		let foregroundRunning = foregroundPushProvider.startState == true
		logger.log(
			"[Notifications.swift] checkStopInAppSocket() called - foreground running: \(foregroundRunning, privacy: .public)"
		)
		if foregroundRunning {
			logger.log("[Notifications.swift] Stopping in-app websocket provider (background manager is active)")
			foregroundPushProvider.stop(with: .superceded) {
				self.logger.log("[Notifications.swift] In-app websocket provider stopped successfully")
			}
		}
		else {
			logger.log("[Notifications.swift] Skipping in-app socket stop - foreground provider not running")
		}
	}

	deinit {
		// Remove KVO observer
		if hasAppStarted {
			removeObserver(self, forKeyPath: "backgroundPushManager.isActive")
		}
	}

	// MARK: - Deep Link Handling

	/**
	 Decodes notification userInfo dictionary into UserInfoData struct.
	
	 - Parameter userInfo: The userInfo dictionary from the notification
	 - Returns: Decoded UserInfoData object, or nil if decoding fails (logs error on failure)
	 */
	private func decodeUserInfo(_ userInfo: [AnyHashable: Any]) -> UserInfoData? {
		guard let typeString = userInfo["type"] as? String,
			let type = NotificationTypeData(rawValue: typeString),
			let urlString = userInfo["url"] as? String
		else {
			Logging.logger.error(
				"Failed to decode UserInfoData from notification userInfo: \(userInfo, privacy: .public)"
			)
			return nil
		}

		return UserInfoData(
			type: type,
			url: urlString,
			markAsReadUrl: userInfo["markAsReadUrl"] as? String
		)
	}

	/**
	 Constructs a deep link URL with the tricordarr:// prefix from a notification URL path.
	 The urlPath should start with a /, so we add tricordarr:/ to get tricordarr://...
	
	 - Parameter urlPath: The URL path from the notification (e.g., "/seamail/123")
	 - Returns: The constructed deep link URL object, or nil if the URL is invalid (logs error on failure)
	 */
	private func createDeepLinkUrl(from urlPath: String) -> URL? {
		let deepLinkUrl = "tricordarr:/\(urlPath)"
		guard let url = URL(string: deepLinkUrl) else {
			Logging.logger.error(
				"Invalid URL string in notification userInfo: \(urlPath, privacy: .public)"
			)
			return nil
		}
		return url
	}

	/**
	 Handles deep linking from a notification response.
	 Decodes the notification's userInfo, constructs a deep link URL, and opens it.
	 Falls back to home screen if decoding fails.
	
	 - Parameter response: The notification response containing userInfo
	 */
	private func handleNotificationDeepLink(_ response: UNNotificationResponse) {
		// Extract the URL from the notification's userInfo
		let userInfo = response.notification.request.content.userInfo

		// Decode userInfo as UserInfoData
		guard let userInfoData = decodeUserInfo(userInfo) else {
			// If no URL is present, navigate to home as a fallback
			if let url = URL(string: "tricordarr://home") {
				Task { @MainActor in
					UIApplication.shared.open(url)
				}
			}
			return
		}

		// Construct the deep link URL with the tricordarr:// prefix
		guard let url = createDeepLinkUrl(from: userInfoData.url) else {
			return
		}

		// Open the deep link URL, which will be handled by AppDelegate's application(_:open:options:)
		// and routed through RCTLinkingManager to React Navigation
		Task { @MainActor in
			if UIApplication.shared.canOpenURL(url) {
				UIApplication.shared.open(url) { success in
					if !success {
						Logging.logger.error(
							"Failed to open deep link URL: \(url.absoluteString, privacy: .public)"
						)
					}
				}
			}
			else {
				Logging.logger.error(
					"Cannot open deep link URL: \(url.absoluteString, privacy: .public)"
				)
			}
		}
	}
}

// MARK: - NEAppPushDelegate

extension Notifications: NEAppPushDelegate {
	public func appPushManager(
		_ manager: NEAppPushManager,
		didReceiveIncomingCallWithUserInfo userInfo: [AnyHashable: Any] = [:]
	) {
		logger.log(
			"[Notifications.swift] LocalPush received an incoming call notification with userInfo: \(userInfo.count, privacy: .public) keys"
		)
		// Handle incoming call notifications if needed
		// For now, just log it
	}
}
