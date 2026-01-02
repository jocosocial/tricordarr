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
}

extension BackgroundPushManagerStatus {
	var asDictionary: [String: Any] {
		var dict: [String: Any] = [
			"matchSSIDs": matchSSIDs,
		]
		if let isActive = isActive {
			dict["isActive"] = isActive
		} else {
			dict["isActive"] = NSNull()
		}
		if let isEnabled = isEnabled {
			dict["isEnabled"] = isEnabled
		} else {
			dict["isEnabled"] = NSNull()
		}
		return dict
	}
}
