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

	var appVersion: String = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown"
}
