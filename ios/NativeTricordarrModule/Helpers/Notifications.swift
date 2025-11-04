//
//  Notifications.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/2/25.
//

import Foundation
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

	/**
	 Configure the providers with settings. Called from the JavaScript side over the "bridge".
   @TODO this should ensure the background manager and foreground provider cycle.
	 */
	@objc static func saveSettings(socketUrl: String, token: String) {
		if let urlComponents = URLComponents(string: socketUrl) {
			Notifications.shared.foregroundPushProvider.updateConfig(serverURL: urlComponents.url, token: token)
		}
		Notifications.shared.checkStartInAppSocket()
	}
  
  // MARK: - Notification Handling
  
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
