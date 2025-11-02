//
//  PushNotifications.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/2/25.
//

import Foundation

@objc class Notifications: NSObject, UNUserNotificationCenterDelegate {
	static let shared = Notifications()

	/// Generates and posts a local notification containing custom content and metadata.
	///
	/// Mostly mirrors what's going on in https://github.com/jocosocial/tricordarr/blob/main/src/Libraries/Notifications/Content.ts
	/// The userInfo (aka "data") payload is arbitrary metadata that is associated with the notification. This payload is read during various
	/// app event handlers to trigger certain behavior.
	///
	/// - Parameters:
	///   - id: A unique identifier for the notification. Defaults to a new `UUID()` if not provided.
	///   - title: The title text displayed in the notification banner.
	///   - body: The body text displayed below the title in the notification.
	///   - type: String value of https://github.com/jocosocial/tricordarr/blob/main/src/Structs/SocketStructs.ts
	///   - url: A URL string associated with the content. This is typically used for deep linking.
	///   - markAsReadUrl: An optional URL string used to mark the content as read when acted upon.
	@objc static func generateContentNotification(
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

	class func appForegrounded() {
		let center = UNUserNotificationCenter.current()
		center.getDeliveredNotifications { notifications in
			Notifications.shared.processNotifications(notifications)
			// Remove older notifications; keep ones that are within 10 minutes of delivery (during this time,
			// people may still be getting to the event the notification is reminding them of).
			let oldNotifications = notifications.compactMap { notification in
				notification.date < Date() - 60 * 10 ? notification.request.identifier : nil
			}

			center.removeDeliveredNotifications(withIdentifiers: oldNotifications)
		}
	}

	func processNotifications(_ notifications: [UNNotification]) {
		notifications.forEach { notification in
			Logging.logger.info("processNotifications \(notification.request.content.title)")
		}
	}
}
