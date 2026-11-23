//
//  Notifications.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/2/25.
//

import Foundation
import Intents
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
	public static let shared = Notifications()

	/// The pushManager is the instance that handles the local push provider.
	@objc dynamic var backgroundPushManager: NEAppPushManager?
	/// InApp runs when app is foregrounded and the extension isn't running.
	@objc dynamic var foregroundPushProvider = WebsocketNotifierGroup(isInApp: true)
	/// This timer is used in various places to determine if the foregroundPushProvider should be started.
	private var providerDownTimer: Timer?
	/// Logger for this class
	private let logger = Logging.getLogger("Notifications")
	/// The accounts JS last synced, for configuring the background manager and the in-app provider
	private var storedAccounts: [PushAccountConfig] = []
	/// KVO observation token for backgroundPushManager.isActive
	private var isActiveObservation: NSKeyValueObservation?
	/// Observer token for AppConfig change notifications
	private var appConfigObserver: NSObjectProtocol?

	override init() {
		super.init()
		appConfigObserver = NotificationCenter.default.addObserver(
			forName: .appConfigDidChange,
			object: nil,
			queue: .main
		) { [weak self] notification in
			self?.handleAppConfigChange(notification)
		}
	}

	/**
	 Replaces the accounts the providers hold notification sockets for. Called from the JavaScript side
	 over the "bridge" with the same JSON Android gets (see `PushAccount` in `Push/PushAccounts.ts`), on
	 launch and whenever the accounts, their tokens or their preferences change. An empty list turns
	 everything off.
	 */
	@objc public static func syncPushAccounts(accountsJson: String) {
		let accounts = PushAccountConfig.list(fromJson: accountsJson)
		// The providers use timers and KVO that expect the main thread.
		DispatchQueue.main.async {
			let instance = Notifications.shared
			instance.logger.log(
				"[Notifications.swift] syncPushAccounts with \(accounts.count, privacy: .public) accounts"
			)
			WebsocketNotifier.prunePersistedStatus(keeping: Set(accounts.map { $0.accountID }))
			if accounts.isEmpty {
				clearSettings()
				return
			}
			instance.saveSettings(accounts: accounts)
			appStarted()
		}
	}

	/**
	 Configure the providers with the synced accounts.
	 Ensures foreground/background providers are reconciled after config updates.
	 */
	private func saveSettings(accounts: [PushAccountConfig]) {
		// Store settings for background manager configuration
		storedAccounts = accounts

		// Update foreground provider
		foregroundPushProvider.setAccounts(accounts)
		reconcileProviderCycle(reason: "saveSettings")

		// Update background manager if it exists
		if let manager = backgroundPushManager {
			saveSettings(for: manager)
		}
	}

	/**
	 Clears all stored notification settings and stops all providers.
	 Provides a clean slate by clearing the stored accounts, disabling the background push manager,
	 and stopping/clearing the foreground push provider.
	 */
	static func clearSettings() {
		let instance = Notifications.shared
		instance.logger.log("[Notifications.swift] clearSettings called")

		// Clear stored settings
		instance.storedAccounts = []

		// Stop foreground push provider if running
		instance.checkStopInAppSocket()

		// Clear foreground push provider config
		instance.foregroundPushProvider.setAccounts([])

		// Disable background push manager if it exists and is currently enabled.
		// Skip save when already disabled to avoid duplicate save and "configuration is unchanged" / NEAppPushErrorDomain errors.
		if let manager = instance.backgroundPushManager, manager.isEnabled {
			manager.isEnabled = false
			manager.saveToPreferences { error in
				if let error = error {
					instance.logger.error(
						"[Notifications.swift] Error saving disabled push manager preferences: \(error.localizedDescription, privacy: .public)"
					)
					return
				}
				instance.logger.log("[Notifications.swift] Push manager disabled and preferences saved")
			}
		}

		// Invalidate and clear the provider down timer
		instance.providerDownTimer?.invalidate()
		instance.providerDownTimer = nil

		// Invalidate and clear the KVO observer
		instance.isActiveObservation?.invalidate()
		instance.isActiveObservation = nil

		// AppConfig observer is intentionally kept alive; the handler
		// guards on prerequisites and will no-op after clearSettings.

		instance.logger.log("[Notifications.swift] clearSettings completed")
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
				matchSSIDs: [],
				providerConfiguration: nil
			)
		}

		return BackgroundPushManagerStatus(
			isActive: manager.isActive,
			isEnabled: manager.isEnabled,
			matchSSIDs: manager.matchSSIDs,
			providerConfiguration: manager.providerConfiguration
		)
	}

	/**
	 Gets the current status of the background push manager as a dictionary.
	 Objective-C bridge method that converts BackgroundPushManagerStatus to [String: Any].
	 Called from the Objective-C bridge.
	
	 - Returns: Dictionary with keys: "isActive" (Bool or NSNull), "isEnabled" (Bool or NSNull), "matchSSIDs" ([String] as NSArray), "providerConfiguration" (String as JSON or NSNull)
	 */
	@objc public static func getBackgroundPushManagerStatusDictionary() -> [String: Any] {
		return getBackgroundPushManagerStatus().asDictionary
	}

	/**
	 Gets the current status of the foreground push provider.
	 Returns a ForegroundPushProviderStatus struct with lastPing, isActive, and socketPingInterval properties.
	 Called from the JavaScript side over the "bridge".
	
	 - Returns: ForegroundPushProviderStatus struct with optional lastPing (ISO8601 string), isActive boolean, and socketPingInterval double
	 */
	static func getForegroundPushProviderStatus() -> ForegroundPushProviderStatus {
		let provider = Notifications.shared.foregroundPushProvider
		let formatter = ISO8601DateFormatter()
		formatter.formatOptions.insert(.withFractionalSeconds)

		let lastPingString: String? = provider.lastPing.map { formatter.string(from: $0) }

		return ForegroundPushProviderStatus(
			lastPing: lastPingString,
			isActive: provider.startState,
			socketPingInterval: provider.socketPingInterval
		)
	}

	/**
	 Gets the current status of the foreground push provider as a dictionary.
	 Objective-C bridge method that converts ForegroundPushProviderStatus to [String: Any].
	 Called from the Objective-C bridge.
	
	 - Returns: Dictionary with keys: "lastPing" (String as ISO8601 or NSNull), "isActive" (Bool or NSNull), "socketPingInterval" (Double or NSNull)
	 */
	@objc public static func getForegroundPushProviderStatusDictionary() -> [String: Any] {
		return getForegroundPushProviderStatus().asDictionary
	}

	/**
	 Gets the current status of each synced account's websocket connection, however it is being run
	 (extension or in-app). Read from the shared App Group UserDefaults suite since `WebsocketNotifier`
	 persists its status there, which works regardless of which process currently owns the socket.
	 Called from the Objective-C bridge.

	 - Returns: One dictionary per account with keys: "accountID", "state", "lastHealthcheckAt", "lastHealthcheckSuccess", "lastError", "lastErrorAt" (String/Bool/Double or NSNull; the `*At` timestamps are epoch milliseconds)
	 */
	@objc public static func getWebsocketStatusDictionaries() -> [[String: Any]] {
		return Notifications.shared.storedAccounts.map {
			WebsocketNotifier.persistedStatus(accountID: $0.accountID).asDictionary
		}
	}

	// MARK: - Notification Generation

	/**
	 Generates and posts a local notification containing custom content and metadata.
	 Mostly mirrors what's going on in `src/Libraries/Notifications/Content.ts`.
	 The userInfo (aka "data") payload is arbitrary metadata that is associated with the notification. This payload is read during various
	 app event handlers to trigger certain behavior.
	
	 - Parameters:
	   - id: A unique identifier for the notification. Defaults to a new UUID string if not provided.
	   - title: The title text displayed in the notification banner.
	   - body: The body text displayed below the title in the notification.
	   - type: String value of `src/Structs/SocketStructs.ts`.
	   - url: A URL string associated with the content. This is typically used for deep linking.
	   - markAsReadUrl: An optional URL string used to mark the content as read when acted upon.
	   - secondaryContentID: An optional ID of a related parent object (the Forum ID for forum post notifications), used to dismiss related notifications.
	   - accountID: The account whose socket delivered the event. Scopes the notification's identity and thread, and travels in the tap's deep link.
	   - accountName: The account's username, shown as the subtitle. Passed only when several accounts are connected.
	   - sender: For chat events, the author of the message. When present the notification posts as a communication
	     notification showing the sender and `senderAvatar`, falling back to a plain one if the system refuses.
	   - senderAvatar: The sender's avatar, from `NotificationAvatar`.
	 */
	static func generateContentNotification(
		_ id: String = UUID().uuidString,
		title: String,
		body: String,
		type: NotificationTypeData,
		url: String,
		markAsReadUrl: String? = nil,
		secondaryContentID: String? = nil,
		accountID: String? = nil,
		accountName: String? = nil,
		sender: UserHeader? = nil,
		senderAvatar: INImage? = nil
	) {
		// `userInfo` is the notification's data payload. The tap handler and the cancel functions read it back.
		let userInfo = UserInfoData(
			type: type,
			url: url,
			markAsReadUrl: markAsReadUrl,
			secondaryContentID: secondaryContentID,
			accountID: accountID,
			contentID: id
		)

		// Construct the notification payload
		let content = UNMutableNotificationContent()
		content.title = title
		content.body = body
		content.sound = .default
		content.userInfo = userInfo.asDictionary
		if let accountID = accountID {
			content.threadIdentifier = accountID
		}
		if let accountName = accountName, !accountName.isEmpty {
			content.subtitle = accountName
		}

		let contentIdentifier = contentNotificationIdentifier(id, accountID: accountID)
		// Most content has one notification, replaced by the next event about it. A chat instead
		// gets one notification per message, all in the chat's own thread, so iOS stacks them per
		// conversation as Messages does (Android appends to one MessagingStyle notification).
		var requestIdentifier = contentIdentifier
		if type.eventSpec?.messaging == true {
			requestIdentifier = "\(contentIdentifier):\(UUID().uuidString)"
			content.threadIdentifier = contentIdentifier
		}
		var finalContent: UNNotificationContent = content
		if let sender = sender {
			finalContent = communicationContent(
				content,
				sender: sender,
				avatar: senderAvatar,
				conversationID: contentIdentifier,
				conversationName: title
			)
		}

		// Send it
		let request = UNNotificationRequest(
			identifier: requestIdentifier,
			content: finalContent,
			trigger: nil
		)
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

	/**
	 Turns `content` into a communication notification from `sender`, so iOS shows their avatar with the
	 app icon as a badge. `conversationName` (the event title, e.g. "New Seamail") is the group name, as
	 the conversation title is on Android. Needs the Communication Notifications entitlement; without it,
	 or if the system refuses, `content` is returned unchanged.
	 */
	private static func communicationContent(
		_ content: UNMutableNotificationContent,
		sender: UserHeader,
		avatar: INImage?,
		conversationID: String,
		conversationName: String
	) -> UNNotificationContent {
		let person = INPerson(
			personHandle: INPersonHandle(value: sender.userID.uuidString, type: .unknown),
			nameComponents: nil,
			displayName: sender.displayName ?? sender.username,
			image: avatar,
			contactIdentifier: nil,
			customIdentifier: sender.userID.uuidString
		)
		let intent = INSendMessageIntent(
			recipients: nil,
			outgoingMessageType: .outgoingMessageText,
			content: content.body,
			speakableGroupName: INSpeakableString(spokenPhrase: conversationName),
			conversationIdentifier: conversationID,
			serviceName: nil,
			sender: person,
			attachments: nil
		)
		intent.setImage(avatar, forParameterNamed: \.sender)
		let interaction = INInteraction(intent: intent, response: nil)
		interaction.direction = .incoming
		interaction.donate { error in
			if let error = error {
				Logging.logger.log(
					"[Notifications.swift] Could not donate message interaction: \(error.localizedDescription, privacy: .public)"
				)
			}
		}
		do {
			return try content.updating(from: intent)
		} catch {
			Logging.logger.log(
				"[Notifications.swift] Posting without sender avatar: \(error.localizedDescription, privacy: .public)"
			)
			return content
		}
	}

	/// Content IDs are only unique within an account, so a notification's identifier is scoped to its account.
	private static func contentNotificationIdentifier(_ contentID: String, accountID: String?) -> String {
		guard let accountID = accountID else { return contentID }
		return "\(accountID):\(contentID)"
	}

	/**
	 Removes the delivered notifications for one piece of content of an account: its single
	 notification, or every message notification in a chat's stack.
	 Called from the JavaScript side over the "bridge".
	 */
	@objc public static func cancelContentNotification(accountID: String, contentID: String) {
		let center = UNUserNotificationCenter.current()
		// The bare content ID covers notifications delivered before identifiers were per account.
		center.removeDeliveredNotifications(withIdentifiers: [
			contentNotificationIdentifier(contentID, accountID: accountID), contentID,
		])
		center.getDeliveredNotifications { notifications in
			let identifiers = notifications.compactMap { notification -> String? in
				let userInfo = notification.request.content.userInfo
				guard userInfo["contentID"] as? String == contentID,
					userInfo["accountID"] as? String == accountID
				else { return nil }
				return notification.request.identifier
			}
			Logging.logger.log(
				"[Notifications.swift] cancelContentNotification removing \(identifiers.count, privacy: .public) of \(notifications.count, privacy: .public) delivered"
			)
			center.removeDeliveredNotifications(withIdentifiers: identifiers)
		}
	}

	/**
	 Removes every delivered notification of an account that belongs to a parent object, e.g. a forum.
	 Called from the JavaScript side over the "bridge".
	 */
	@objc public static func cancelSecondaryNotifications(accountID: String, secondaryContentID: String) {
		let center = UNUserNotificationCenter.current()
		center.getDeliveredNotifications { notifications in
			let identifiers = notifications.compactMap { notification -> String? in
				let userInfo = notification.request.content.userInfo
				let notificationAccountID = userInfo["accountID"] as? String
				guard userInfo["secondaryContentID"] as? String == secondaryContentID,
					notificationAccountID == nil || notificationAccountID == accountID
				else { return nil }
				return notification.request.identifier
			}
			center.removeDeliveredNotifications(withIdentifiers: identifiers)
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

	// MARK: - Background Push Manager Configuration

	/**
	 Configures an NEAppPushManager with provider configuration and matchSSIDs.
	
	 - Parameter manager: The NEAppPushManager to configure
	 */
	private func saveSettings(for manager: NEAppPushManager) {
		logger.info("[Notifications.swift] saveSettings for manager")

		guard !storedAccounts.isEmpty else {
			logger.error("[Notifications.swift] Cannot save settings for manager: no accounts")
			return
		}

		guard let appConfig = AppConfig.shared else {
			logger.error("[Notifications.swift] Cannot save settings for manager: AppConfig.shared is nil")
			return
		}

		let settings = PushManagerSettings(accounts: storedAccounts, appConfig: appConfig)

		//
		guard settings.hasManagerChanged(manager) || !manager.isEnabled else {
			logger.log("[Notifications.swift] Configuration unchanged, skipping saveToPreferences")
			return
		}

		manager.providerConfiguration = settings.providerConfiguration
		manager.matchSSIDs = settings.matchSSIDs
		manager.isEnabled = true
		manager.providerBundleIdentifier = "com.grantcohoe.tricordarr.LocalPushExtension"
		manager.localizedDescription = "App Extension for Background Server Communication"

		manager.saveToPreferences { error in
			if let error = error {
				self.logger.error(
					"[Notifications.swift] Error saving push manager preferences: \(error.localizedDescription, privacy: .public)"
				)
				self.reconcileProviderCycle(reason: "saveToPreferences-failure")
				return
			}

			self.logger.log("[Notifications.swift] Push manager preferences saved successfully")
			self.reconcileProviderCycle(reason: "saveToPreferences-success")
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

	/// Reconciles ownership between background manager and in-app foreground provider.
	/// If the background provider is active, the in-app provider is stopped.
	/// Otherwise the in-app provider is started immediately or after an optional delay.
	private func reconcileProviderCycle(reason: String, fallbackDelay: TimeInterval? = nil) {
		if backgroundPushManager?.isActive == true {
			logger.log(
				"[Notifications.swift] reconcileProviderCycle \(reason, privacy: .public): background active, stopping in-app provider"
			)
			providerDownTimer?.invalidate()
			providerDownTimer = nil
			checkStopInAppSocket()
			return
		}

		if let fallbackDelay {
			logger.log(
				"[Notifications.swift] reconcileProviderCycle \(reason, privacy: .public): background inactive, scheduling in-app provider in \(fallbackDelay, privacy: .public)s"
			)
			providerDownTimer?.invalidate()
			providerDownTimer = Timer.scheduledTimer(withTimeInterval: fallbackDelay, repeats: false) { [weak self] _ in
				self?.checkStartInAppSocket()
			}
			return
		}

		logger.log(
			"[Notifications.swift] reconcileProviderCycle \(reason, privacy: .public): background inactive, starting in-app provider"
		)
		providerDownTimer?.invalidate()
		providerDownTimer = nil
		checkStartInAppSocket()
	}

	// MARK: - App Startup

	/**
	 Initialize and configure the background push manager at app startup.
	 Loads existing manager from preferences, configures it, sets up observers, and manages the foreground/background provider lifecycle.
	 */
	static func appStarted() {
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
				instance.reconcileProviderCycle(reason: "appStarted", fallbackDelay: 5)
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
		logger.log("[Notifications.swift] handleManagerStateChange")
		if let manager = backgroundPushManager {
			if manager.isActive {
				logger.log("[Notifications.swift] Extension push provider is active")
				reconcileProviderCycle(reason: "manager-active")
			}
			else {
				logger.log("[Notifications.swift] Extension push provider is inactive")
				// Start a 30 second timer. If the provider extension is still offline, enable the
				// in-app provider. This should prevent extra socket cycling for very short Wifi unavailability.
				reconcileProviderCycle(reason: "manager-inactive", fallbackDelay: 30)
			}
		}
		else {
			logger.log("[Notifications.swift] Extension push provider is nil")
		}
	}

	// MARK: - AppConfig Change Handling

	/// Reacts to `AppConfig.setAppConfig` updates by re-saving background manager
	/// settings and reconciling foreground/background provider ownership.
	private func handleAppConfigChange(_ notification: Foundation.Notification) {
		logger.log("[Notifications.swift] appConfigDidChange received")

		guard !storedAccounts.isEmpty, AppConfig.shared != nil else {
			logger.log(
				"[Notifications.swift] appConfigDidChange: prerequisites missing (accounts/appConfig), skipping"
			)
			return
		}

		let oldConfig = notification.userInfo?["oldConfig"] as? AppConfigData
		let newConfig = notification.userInfo?["newConfig"] as? AppConfigData

		if oldConfig?.fgsWorkerHealthTimer != newConfig?.fgsWorkerHealthTimer {
			logger.log(
				"[Notifications.swift] appConfigDidChange: fgsWorkerHealthTimer changed, refreshing foreground ping timer"
			)
			foregroundPushProvider.refreshPingTimer()
		}

		if let manager = backgroundPushManager {
			saveSettings(for: manager)
		}
		else {
			reconcileProviderCycle(reason: "app-config-changed")
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
			markAsReadUrl: userInfo["markAsReadUrl"] as? String,
			accountID: userInfo["accountID"] as? String
		)
	}

	/**
	 Constructs a deep link URL with the tricordarr:// prefix from a notification URL path.
	 The urlPath should start with a /, so we add tricordarr:/ to get tricordarr://...
	 The account travels as an `account` query parameter, which the JavaScript side uses to open the
	 link in that account, switching to it first if another one is active.
	
	 - Parameter urlPath: The URL path from the notification (e.g., "/seamail/123")
	 - Parameter accountID: The account the notification was delivered for, if it recorded one
	 - Returns: The constructed deep link URL object, or nil if the URL is invalid (logs error on failure)
	 */
	private func createDeepLinkUrl(from urlPath: String, accountID: String?) -> URL? {
		var deepLinkUrl = "tricordarr:/\(urlPath)"
		if let accountID = accountID,
			let encoded = accountID.addingPercentEncoding(withAllowedCharacters: .alphanumerics)
		{
			deepLinkUrl += "\(deepLinkUrl.contains("?") ? "&" : "?")account=\(encoded)"
		}
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
		guard let url = createDeepLinkUrl(from: userInfoData.url, accountID: userInfoData.accountID) else {
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
