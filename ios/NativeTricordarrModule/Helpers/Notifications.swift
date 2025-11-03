//
//  Notifications.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/2/25.
//

import Foundation
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
	@objc dynamic var pushManager: NEAppPushManager?
	/// InApp runs when app is foregrounded and the extension isn't running
	@objc dynamic var krakenInAppPushProvider = WebsocketNotifier(isInApp: true)
	private let logger = Logging.getLogger("Notifications")
	private var providerDownTimer: Timer?

	/**
	 Required delegate method to display notifications when app is in foreground. This gets called when a notification is *delivered* while the app is running
   in the foreground. The completion handler argument lets us choose how to show the notification to the user.
   Options: .banner (show banner), .sound (play sound), .badge (update badge)

	 If it's shown to the user (over our app's UI--we're in the FG) and the user taps it, the
   `userNotificationCenter(_:didReceive:withCompletionHandler)` below is called instead.
	 */
	func userNotificationCenter(
		_ center: UNUserNotificationCenter,
		willPresent notification: UNNotification,
		withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
	) {
		completionHandler([.banner, .sound, .badge])
	}

	/**
	 Called when the user taps a notification, whether the notification is displayed while the app running or not.
	 */
	func userNotificationCenter(
		_ center: UNUserNotificationCenter,
		didReceive response: UNNotificationResponse,
		withCompletionHandler completionHandler: @escaping () -> Void
	) {
		// @TODO this should open a deep link to the appropriate content.
		completionHandler()
	}

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
		type: String,
		url: String,
		markAsReadUrl: String? = nil
	) {
		// Construct the userInfo data
		var userInfo: [String: String] = [
			"type": type,
			"url": url,
		]
		if let markAsReadUrl {
			userInfo["markAsReadUrl"] = markAsReadUrl
		}

		// Construct the notification payload
		let content = UNMutableNotificationContent()
		content.title = title
		content.body = body
		content.sound = .default
		content.userInfo = userInfo

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

	@objc static func testNotification() {
		Logging.logger.info("generating test notification")
		generateContentNotification(
			title: "Test Notification",
			body: "This is a test",
			type: "announcement",
			url: "http://localhost"
		)
	}

	/**
	 Process displaying notifications as the app comes into the foreground. Often this will do nothing, but if the user has a ton of old
	 notifications then it will clear them out automatically.
	 */
	class func appForegrounded() {
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
  
  func appStarted() {
    // If at app launch the extension isn't running, start using in-app provider.
    providerDownTimer = Timer.scheduledTimer(withTimeInterval: 5, repeats: false) { timer in
      self.checkStartInAppSocket()
    }
  }
  
  @objc static func saveSettings(socketUrl: String, token: String) {
    if let urlComponents = URLComponents(string: socketUrl) {
      Notifications.shared.krakenInAppPushProvider.updateConfig(serverURL: urlComponents.url, token: token)
    }
    Notifications.shared.checkStartInAppSocket()
  }

	// MARK: - In-app pushProvider

	// At app launch, app fg, or after 30 secs of the app extension being offline,
  // try starting the in-app websocket for notifications.
	// Try to ensure the app extension's socket and our in-app socket are not running at the same time.
	func checkStartInAppSocket() {
		if pushManager?.isActive != true, krakenInAppPushProvider.startState == false {
			krakenInAppPushProvider.start()
		}
	}

	func checkStopInAppSocket() {
		if krakenInAppPushProvider.startState == true {
			krakenInAppPushProvider.stop(with: .superceded) {}
		}
	}
}
