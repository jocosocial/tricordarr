//
//  AppConfig.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/4/25.
//

import Foundation

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
			shared = try JSONDecoder().decode(AppConfigData.self, from: jsonData)
			Logging.logger.log("[AppConfig.swift] Successfully decoded and stored AppConfig")
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
		Notifications.saveSettings(socketUrl: socketUrl, token: token)
		if enable {
			Notifications.appStarted()
		}
	}
}
