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
@objc class Notifications: NSObject, UNUserNotificationCenterDelegate {
	static let shared = Notifications()

	/// The pushManager is the instance that handles the local push provider.
	@objc dynamic var backgroundPushManager: NEAppPushManager?
	/// InApp runs when app is foregrounded and the extension isn't running.
	@objc dynamic var foregroundPushProvider = WebsocketNotifier(isInApp: true)
	/// This timer is used in various places to determine if the foregroundPushProvider should be started.
	private var providerDownTimer: Timer?
	/// Logger for this class
	private let logger = Logging.getLogger("Notifications")
	/// Stored socket URL and token for configuring the background manager
	private var storedSocketUrl: String?
	private var storedToken: String?
	/// KVO observation token for backgroundPushManager.isActive
	private var isActiveObservation: NSKeyValueObservation?

	/**
	 Configure the providers with settings. Called from the JavaScript side over the "bridge".
   @TODO this should ensure the background manager and foreground provider cycle.
	 */
	@objc static func saveSettings(socketUrl: String, token: String) {
		// Store settings for background manager configuration
		Notifications.shared.storedSocketUrl = socketUrl
		Notifications.shared.storedToken = token

		// Update foreground provider
		if let urlComponents = URLComponents(string: socketUrl) {
			Notifications.shared.foregroundPushProvider.updateConfig(serverURL: urlComponents.url, token: token)
		}
		Notifications.shared.checkStartInAppSocket()

		// Update background manager if it exists
		if let manager = Notifications.shared.backgroundPushManager {
			Notifications.shared.saveSettings(for: manager)
		}
	}

	/**
	 Gets the current status of the background push manager.
	 Returns a BackgroundPushManagerStatus struct with isActive, isEnabled, and matchSSIDs properties.
	 Called from the JavaScript side over the "bridge".
	
	 - Returns: BackgroundPushManagerStatus struct with optional isActive and isEnabled booleans, and matchSSIDs array
	 */
	static func getBackgroundPushManagerStatus() -> BackgroundPushManagerStatus {
		guard let manager = Notifications.shared.backgroundPushManager else {
			return BackgroundPushManagerStatus(
				isActive: nil,
				isEnabled: nil,
				matchSSIDs: []
			)
		}

		return BackgroundPushManagerStatus(
			isActive: manager.isActive,
			isEnabled: manager.isEnabled,
			matchSSIDs: manager.matchSSIDs
		)
	}

	/**
	 Gets the current status of the background push manager as a dictionary.
	 Objective-C bridge method that converts BackgroundPushManagerStatus to [String: Any].
	 Called from the Objective-C bridge.
	
	 - Returns: Dictionary with keys: "isActive" (Bool or NSNull), "isEnabled" (Bool or NSNull), "matchSSIDs" ([String] as NSArray)
	 */
	@objc static func getBackgroundPushManagerStatusDictionary() -> [String: Any] {
		return getBackgroundPushManagerStatus().asDictionary
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
						"[Notifications.swift] Error submitting local notification: \(error.localizedDescription, privacy: .public)"
					)
					return
				}

				Logging.logger.log("[Notifications.swift] Local notification posted successfully")
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
	func userNotificationCenter(
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
	static func appForegrounded() {
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
	func userNotificationCenter(
		_ center: UNUserNotificationCenter,
		didReceive response: UNNotificationResponse,
		withCompletionHandler completionHandler: @escaping () -> Void
	) {
		handleNotificationDeepLink(response)
		completionHandler()
	}

	// MARK: - Background Push Manager Configuration

	/**
	 Configures an NEAppPushManager with provider configuration and matchSSIDs.
	
	 - Parameter manager: The NEAppPushManager to configure
	 */
	private func saveSettings(for manager: NEAppPushManager) {
		guard let socketUrl = storedSocketUrl, let token = storedToken else {
			logger.error("[Notifications.swift] Cannot save settings for manager: socketUrl or token is nil")
			return
		}

		guard let appConfig = AppConfig.shared else {
			logger.error("[Notifications.swift] Cannot save settings for manager: AppConfig.shared is nil")
			return
		}

		// Configure provider configuration dictionary
		var providerConfig: [String: Any] = [:]
		providerConfig["twitarrURL"] = socketUrl
		providerConfig["token"] = token
		manager.providerConfiguration = providerConfig

		// Set matchSSIDs from AppConfig
		manager.matchSSIDs = appConfig.wifiNetworkNames
    
    manager.isEnabled = true
    manager.providerBundleIdentifier = "com.grantcohoe.tricordarr.LocalPushExtension"
    manager.localizedDescription = "App Extension for Background Server Communication"

		// Save to preferences
		manager.saveToPreferences { error in
			if let error = error {
				self.logger.error(
					"[Notifications.swift] Error saving push manager preferences: \(error.localizedDescription, privacy: .public)"
				)
				return
			}

			self.logger.log("[Notifications.swift] Push manager preferences saved successfully")
		}
	}

	// MARK: - Foreground Push Provider

	/**
	 At app launch, app fg, or after 30 secs of the app extension being offline, try starting the in-app websocket for notifications.
	 Try to ensure the app extension's socket and our in-app socket are not running at the same time.
	 */
	func checkStartInAppSocket() {
		if backgroundPushManager?.isActive != true, foregroundPushProvider.startState == false {
			foregroundPushProvider.start()
		}
	}

	/**
	 Attempt to shut down the foreground provider. Usually called when the background manager says the
	 background provider is active.
	 */
	func checkStopInAppSocket() {
		if foregroundPushProvider.startState == true {
			foregroundPushProvider.stop(with: .superceded) {}
		}
	}

	// MARK: - App Startup

	/**
	 Initialize and configure the background push manager at app startup.
	 Loads existing manager from preferences, configures it, sets up observers, and manages the foreground/background provider lifecycle.
	 */
	@objc static func appStarted() {
		#if !targetEnvironment(simulator)
			let instance = Notifications.shared

			// Load existing managers from preferences
			NEAppPushManager.loadAllFromPreferences { managers, error in
				if let error = error {
					instance.logger.error(
						"[Notifications.swift] Couldn't load push manager prefs: \(error.localizedDescription, privacy: .public)"
					)
					return
				}

				// Use existing manager or create new one
				let manager = managers?.first ?? NEAppPushManager()

				// Configure and save settings
				instance.backgroundPushManager = manager
				instance.saveSettings(for: manager)

				// Set up KVO observer for isActive property
				instance.setupIsActiveObserver()

				// If at app launch the extension isn't running, start using in-app provider after 5 seconds
				instance.providerDownTimer = Timer.scheduledTimer(withTimeInterval: 5, repeats: false) { _ in
					instance.checkStartInAppSocket()
				}
			}
		#endif
	}

	/**
	 Sets up KVO observer for backgroundPushManager.isActive property changes.
	 */
	private func setupIsActiveObserver() {
		// Remove existing observer if any
		isActiveObservation?.invalidate()

		guard let manager = backgroundPushManager else {
			return
		}

		// Observe isActive property changes on the manager directly
		isActiveObservation = manager.observe(\.isActive, options: [.new, .old]) { [weak self] _, change in
			guard let self = self else { return }
			self.handleManagerStateChange()
		}
	}

	/**
	 Handles changes to the manager's active state.
	 */
	private func handleManagerStateChange() {
		if let manager = backgroundPushManager {
			if manager.isActive {
				logger.log("[Notifications.swift] Extension push provider is active")
				checkStopInAppSocket()
				providerDownTimer?.invalidate()
				providerDownTimer = nil
			}
			else {
				logger.log("[Notifications.swift] Extension push provider is inactive")
				// Start a 30 second timer. If the provider extension is still offline, enable the
				// in-app provider. This should prevent extra socket cycling for very short Wifi unavailability.
				providerDownTimer?.invalidate()
				providerDownTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: false) { [weak self] _ in
					self?.checkStartInAppSocket()
				}
			}
		}
		else {
			logger.log("[Notifications.swift] Extension push provider is nil")
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
			logger.error(
				"[Notifications.swift] Failed to decode UserInfoData from notification userInfo: \(userInfo, privacy: .public)"
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
			logger.error(
				"[Notifications.swift] Invalid URL string in notification userInfo: \(urlPath, privacy: .public)"
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
				UIApplication.shared.open(url)
			}
			return
		}

		// Construct the deep link URL with the tricordarr:// prefix
		guard let url = createDeepLinkUrl(from: userInfoData.url) else {
			return
		}

		// Open the deep link URL, which will be handled by AppDelegate's application(_:open:options:)
		// and routed through RCTLinkingManager to React Navigation
		if UIApplication.shared.canOpenURL(url) {
			UIApplication.shared.open(url) { success in
				if !success {
					self.logger.error(
						"[Notifications.swift] Failed to open deep link URL: \(url.absoluteString, privacy: .public)"
					)
				}
			}
		}
		else {
			logger.error(
				"[Notifications.swift] Cannot open deep link URL: \(url.absoluteString, privacy: .public)"
			)
		}
	}
}
