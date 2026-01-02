//
//  LocalPushProvider.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 1/1/26.
//


import os
import Foundation
import NetworkExtension
import TricordarrKit

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
  var websocketNotifier = WebsocketNotifier()
  let logger = Logging.getLogger("LocalPushProvider")

	override init() {
		super.init()
    logger.log("[LocalPushProvider.swift] init() - Extension initialized")
//		websocketNotifier.pushProvider = self
    logger.log("[LocalPushProvider.swift] init() - WebsocketNotifier configured with pushProvider")
	}

	override func start() {
    logger.log("[LocalPushProvider.swift] start() called - Extension starting")
		
		// Log provider configuration if available
		if let config = providerConfiguration {
      logger.log(
				"[LocalPushProvider.swift] Provider configuration available with \(config.count, privacy: .public) keys"
			)
			if let twitarrURL = config["twitarrURL"] as? String {
        logger.log(
					"[LocalPushProvider.swift] twitarrURL from config: \(twitarrURL, privacy: .private)"
				)
			} else {
        logger.error("[LocalPushProvider.swift] twitarrURL not found in provider configuration")
			}
			if let token = config["token"] as? String {
        logger.log(
					"[LocalPushProvider.swift] token from config: \(token.isEmpty ? "empty" : "present", privacy: .public)"
				)
			} else {
        logger.error("[LocalPushProvider.swift] token not found in provider configuration")
			}
		} else {
      logger.error("[LocalPushProvider.swift] Provider configuration is nil")
		}
		
		// Update config and start
    logger.log("[LocalPushProvider.swift] Calling websocketNotifier.updateConfig()")
//		websocketNotifier.updateConfig()
    logger.log("[LocalPushProvider.swift] Calling websocketNotifier.start()")
//		websocketNotifier.start()
    logger.log("[LocalPushProvider.swift] start() completed")
	}

	override func stop(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
    logger.log(
			"[LocalPushProvider.swift] stop() called with reason: \(reason.rawValue, privacy: .public)"
		)
//		websocketNotifier.stop(with: reason, completionHandler: completionHandler)
	}

	override func handleTimerEvent() {
    logger.log("[LocalPushProvider.swift] handleTimerEvent")
//		websocketNotifier.handleTimerEvent()
	}

	// NEProvider override
	override func sleep(completionHandler: @escaping () -> Void) {
    logger.log("[LocalPushProvider.swift] sleep")
		// Add code here to get ready to sleep.
		completionHandler()
	}

	// NEProvider override
	override func wake() {
    logger.log("[LocalPushProvider.swift] wake")
	}
}
