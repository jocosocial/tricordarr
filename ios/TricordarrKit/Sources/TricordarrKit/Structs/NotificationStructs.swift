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
