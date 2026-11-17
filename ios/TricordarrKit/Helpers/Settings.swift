//
//  Settings.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/3/25.
//

import Foundation

@objc final class Settings: NSObject, Codable {
	static let shared = Settings()

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

	/// Matches what react-native-device-info's `getApplicationName()` reports, so the native and JS
	/// `X-Swiftarr-Client` headers agree.
	var appName: String = Bundle.main.infoDictionary?["CFBundleDisplayName"] as? String
		?? Bundle.main.infoDictionary?["CFBundleName"] as? String ?? "Tricordarr"

	var appVersion: String = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown"

	var bundleId = Bundle.main.bundleIdentifier ?? "com.grantcohoe.unknown"
}
