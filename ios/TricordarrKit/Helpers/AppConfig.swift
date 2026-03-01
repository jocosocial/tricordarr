//
//  AppConfig.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/4/25.
//

import Foundation

extension Notification.Name {
	static let appConfigDidChange = Notification.Name("appConfigDidChange")
}

/// Singleton helper class to manage AppConfig decoded from JSON.
/// Provides access to the decoded AppConfig struct throughout the native iOS code.
@objc public class AppConfig: NSObject {
	static var shared: AppConfigData?

	/// Decodes and stores AppConfig from a JSON string.
	@objc public static func setAppConfig(appConfigJson: String) {
		guard let jsonData = appConfigJson.data(using: .utf8) else {
			Logging.logger.error("[AppConfig.swift] Failed to convert JSON string to Data")
			return
		}

		do {
			let oldConfig = shared
			shared = try JSONDecoder().decode(AppConfigData.self, from: jsonData)
			Logging.logger.log("[AppConfig.swift] Successfully decoded and stored AppConfig")

			var userInfo: [String: Any] = [:]
			if let oldConfig = oldConfig {
				userInfo["oldConfig"] = oldConfig
			}
			if let newConfig = shared {
				userInfo["newConfig"] = newConfig
			}
			NotificationCenter.default.post(name: .appConfigDidChange, object: nil, userInfo: userInfo)
		}
		catch {
			Logging.logger.error(
				"[AppConfig.swift] Failed to decode AppConfig: \(error.localizedDescription, privacy: .public)"
			)
			return
		}
	}

	/// Configures notifications without setting AppConfig.
	@objc public static func setupLocalPushManager(socketUrl: String, token: String, enable: Bool) {
    Logging.logger.info("[AppConfig.swift] setupLocalPushManager")
		Notifications.saveSettings(socketUrl: socketUrl, token: token)
		if enable {
			Notifications.appStarted()
		}
	}
}
