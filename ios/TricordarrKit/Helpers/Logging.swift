//
//  Logging.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/1/25.
//

import Foundation
import os

/**
 Common logging components.
 
 For successful logging, do `self.logger.log` or `Logging.logger.log` rather than `.info` since
 that seems to get eaten in Console.app
 */
public final class Logging {
	public static let logger = Logger(
		subsystem: Bundle.main.bundleIdentifier ?? "com.grantcohoe.unknown",
		category: "App"
	)

	public static func getLogger(_ category: String = "App") -> Logger {
		return Logger(
			subsystem: Bundle.main.bundleIdentifier ?? "com.grantcohoe.unknown",
			category: category
		)
	}
}
