//
//  AppConfig.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/4/25.
//

import Foundation

/// Singleton helper class to manage AppConfig decoded from JSON.
/// Provides access to the decoded AppConfig struct throughout the native iOS code.
@objc class AppConfig: NSObject {
	/// Serial queue for thread-safe access to the shared AppConfigData
	private static let accessQueue = DispatchQueue(label: "com.grantcohoe.tricordarr.appconfig.access")
	
	/// Private shared AppConfigData instance
	/// Synchronization is handled via accessQueue
	nonisolated(unsafe) private static var _shared: AppConfigData?

	/// Thread-safe access to the shared AppConfigData instance
	static var shared: AppConfigData? {
		return accessQueue.sync {
			return _shared
		}
	}

	/// Decodes and stores AppConfig from a JSON string.
	@objc static func setAppConfig(appConfigJson: String) {
		guard let jsonData = appConfigJson.data(using: .utf8) else {
			Logging.logger.error("AppConfig: Failed to convert JSON string to Data")
			return
		}

		accessQueue.sync {
			do {
				_shared = try JSONDecoder().decode(AppConfigData.self, from: jsonData)
				Logging.logger.log("AppConfig: Successfully decoded and stored AppConfig")
			}
			catch {
				Logging.logger.error(
					"AppConfig: Failed to decode AppConfig: \(error.localizedDescription, privacy: .public)"
				)
			}
		}
	}

	/// Configures notifications without setting AppConfig.
	@objc static func setupLocalPushManager(socketUrl: String, token: String, enable: Bool) {
		Notifications.saveSettings(socketUrl: socketUrl, token: token)
	}
}
