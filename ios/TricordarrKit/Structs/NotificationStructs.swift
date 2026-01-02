//
//  NotificationStructs.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/3/25.
//

import Foundation

struct UserInfoData: Codable {
	var type: NotificationTypeData
	var url: String
	var markAsReadUrl: String?
}

extension UserInfoData {
	var asDictionary: [AnyHashable: Any] {
		var dict: [AnyHashable: Any] = [
			"type": type.rawValue,
			"url": url,
		]
		if let markAsReadUrl = markAsReadUrl {
			dict["markAsReadUrl"] = markAsReadUrl
		}
		return dict
	}
}

struct BackgroundPushManagerStatus: Codable {
	var isActive: Bool?
	var isEnabled: Bool?
	var matchSSIDs: [String]
	var providerConfiguration: [String: Any]?

	// Custom coding keys to exclude providerConfiguration from Codable
	enum CodingKeys: String, CodingKey {
		case isActive
		case isEnabled
		case matchSSIDs
	}
}

extension BackgroundPushManagerStatus {
	var asDictionary: [String: Any] {
		var dict: [String: Any] = [
			"matchSSIDs": matchSSIDs
		]
		if let isActive = isActive {
			dict["isActive"] = isActive
		}
		else {
			dict["isActive"] = NSNull()
		}
		if let isEnabled = isEnabled {
			dict["isEnabled"] = isEnabled
		}
		else {
			dict["isEnabled"] = NSNull()
		}
		if let providerConfiguration = providerConfiguration {
			// Serialize dictionary to JSON string for codegen compatibility
			if let jsonData = try? JSONSerialization.data(withJSONObject: providerConfiguration, options: []),
				let jsonString = String(data: jsonData, encoding: .utf8)
			{
				dict["providerConfiguration"] = jsonString
			}
			else {
				dict["providerConfiguration"] = NSNull()
			}
		}
		else {
			dict["providerConfiguration"] = NSNull()
		}
		return dict
	}
}

struct ForegroundPushProviderStatus: Codable {
	var lastPing: String?
	var isActive: Bool?
	var socketPingInterval: Double?
}

extension ForegroundPushProviderStatus {
	var asDictionary: [String: Any] {
		var dict: [String: Any] = [:]
		if let lastPing = lastPing {
			dict["lastPing"] = lastPing
		}
		else {
			dict["lastPing"] = NSNull()
		}
		if let isActive = isActive {
			dict["isActive"] = isActive
		}
		else {
			dict["isActive"] = NSNull()
		}
		if let socketPingInterval = socketPingInterval {
			dict["socketPingInterval"] = socketPingInterval
		}
		else {
			dict["socketPingInterval"] = NSNull()
		}
		return dict
	}
}
