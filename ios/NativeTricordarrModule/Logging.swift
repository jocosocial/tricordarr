//
//  Logging.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/1/25.
//

import Foundation
import os

// Common logging components.
struct Logging {
	static let logger = Logger(
		subsystem: Bundle.main.bundleIdentifier ?? "com.grantcohoe.unknown",
		category: "App"
	)
}
