//
//  Logging.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/1/25.
//

import Foundation
import os

/// Common logging components.
public final class Logging {
	static let logger = Logger(
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
