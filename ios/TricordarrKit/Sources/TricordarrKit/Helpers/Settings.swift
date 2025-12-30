//
//  Settings.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/3/25.
//

import Foundation

@objc final class Settings: NSObject, Codable {
	/// Serial queue for thread-safe access to the shared instance
	private static let accessQueue = DispatchQueue(label: "com.grantcohoe.tricordarr.settings.access")
	
	/// Private shared instance
	/// Synchronization is handled via accessQueue
	nonisolated(unsafe) private static let _shared = Settings()

	/// Thread-safe access to the shared Settings instance
	static var shared: Settings {
		return accessQueue.sync {
			return _shared
		}
	}

	var appPrefix: String = {
		guard let urlTypes = Bundle.main.infoDictionary?["CFBundleURLTypes"] as? [[String: Any]],
			let firstUrlType = urlTypes.first,
			let urlSchemes = firstUrlType["CFBundleURLSchemes"] as? [String],
			let firstScheme = urlSchemes.first,
			!firstScheme.isEmpty
		else {
			return "unknown:/"
		}
		return "\(firstScheme):/"
	}()

	var appVersion: String = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown"
  
  var bundleId = Bundle.main.bundleIdentifier ?? "com.grantcohoe.unknown"
}
