//
//  LocalPushProvider.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 1/1/26.
//


import os
import Foundation
import NetworkExtension
//import TricordarrKit

//
//  TricordarrLocalPushProvider.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 12/29/25.
//

/// Extensions run in separate processes from the main app.
/// https://developer.apple.com/documentation/technologyoverviews/app-extensions
///
class LocalPushProvider: NEAppPushProvider {
  static let logger = Logger(
    subsystem: Bundle.main.bundleIdentifier ?? "com.grantcohoe.unknown",
    category: "App"
  )

	override init() {
		super.init()
    LocalPushProvider.logger.log("[LocalPushProvider.swift] init() - Extension initialized")
//		websocketNotifier.pushProvider = self
    LocalPushProvider.logger.log("[LocalPushProvider.swift] init() - WebsocketNotifier configured with pushProvider")
	}

	override func start() {
    LocalPushProvider.logger.log("[LocalPushProvider.swift] start() called - Extension starting")
		
		// Log provider configuration if available
		if let config = providerConfiguration {
      LocalPushProvider.logger.log(
				"[LocalPushProvider.swift] Provider configuration available with \(config.count, privacy: .public) keys"
			)
			if let twitarrURL = config["twitarrURL"] as? String {
        LocalPushProvider.logger.log(
					"[LocalPushProvider.swift] twitarrURL from config: \(twitarrURL, privacy: .private)"
				)
			} else {
        LocalPushProvider.logger.error("[LocalPushProvider.swift] twitarrURL not found in provider configuration")
			}
			if let token = config["token"] as? String {
        LocalPushProvider.logger.log(
					"[LocalPushProvider.swift] token from config: \(token.isEmpty ? "empty" : "present", privacy: .public)"
				)
			} else {
        LocalPushProvider.logger.error("[LocalPushProvider.swift] token not found in provider configuration")
			}
		} else {
      LocalPushProvider.logger.error("[LocalPushProvider.swift] Provider configuration is nil")
		}
		
		// Update config and start
    LocalPushProvider.logger.log("[LocalPushProvider.swift] Calling websocketNotifier.updateConfig()")
//		websocketNotifier.updateConfig()
    LocalPushProvider.logger.log("[LocalPushProvider.swift] Calling websocketNotifier.start()")
//		websocketNotifier.start()
    LocalPushProvider.logger.log("[LocalPushProvider.swift] start() completed")
	}

	override func stop(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
    LocalPushProvider.logger.log(
			"[LocalPushProvider.swift] stop() called with reason: \(reason.rawValue, privacy: .public)"
		)
//		websocketNotifier.stop(with: reason, completionHandler: completionHandler)
	}

	override func handleTimerEvent() {
    LocalPushProvider.logger.log("[LocalPushProvider.swift] handleTimerEvent")
//		websocketNotifier.handleTimerEvent()
	}

	// NEProvider override
	override func sleep(completionHandler: @escaping () -> Void) {
    LocalPushProvider.logger.log("[LocalPushProvider.swift] sleep")
		// Add code here to get ready to sleep.
		completionHandler()
	}

	// NEProvider override
	override func wake() {
    LocalPushProvider.logger.log("[LocalPushProvider.swift] wake")
	}
}
