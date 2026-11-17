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
  /// One provider for every account: a socket per account in the provider configuration.
  var websocketNotifier = WebsocketNotifierGroup()
  let logger = Logging.getLogger("TricordarrLocalPushProvider")

	override init() {
		super.init()
    logger.log("[LocalPushProvider.swift] init() - Extension initialized")
		websocketNotifier.pushProvider = self
    logger.log("[LocalPushProvider.swift] init() - WebsocketNotifier configured with pushProvider")
	}

	override func start() {
    logger.log("[LocalPushProvider.swift] start() called - Extension starting")
		
		// Log provider configuration if available
		if let config = providerConfiguration {
      logger.log(
				"[LocalPushProvider.swift] Provider configuration available with \(config.count, privacy: .public) keys"
			)
			let accountCount = (config["accounts"] as? [Any])?.count ?? 0
      logger.log(
				"[LocalPushProvider.swift] accounts in config: \(accountCount, privacy: .public)"
			)
		} else {
      logger.error("[LocalPushProvider.swift] Provider configuration is nil")
		}
		
		// Update config and start
    logger.log("[LocalPushProvider.swift] Calling websocketNotifier.updateConfig()")
		websocketNotifier.updateConfig()
    logger.log("[LocalPushProvider.swift] Calling websocketNotifier.start()")
		websocketNotifier.start()
		if let config = providerConfiguration {
			WebsocketNotifier.postDebugLifecycleNotification(
				providerConfiguration: config,
				title: "Background provider started",
				body: "Extension push provider is running."
			)
		}
    logger.log("[LocalPushProvider.swift] start() completed")
	}

	override func stop(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
    logger.log(
			"[LocalPushProvider.swift] stop() called with reason: \(reason.rawValue, privacy: .public)"
		)
		if let config = providerConfiguration {
			WebsocketNotifier.postDebugLifecycleNotification(
				providerConfiguration: config,
				title: "Background provider stopped",
				body: "Extension push provider stopped. Reason: \(reason.rawValue)."
			)
		}
		websocketNotifier.stop(with: reason, completionHandler: completionHandler)
	}

	override func handleTimerEvent() {
    logger.log("[LocalPushProvider.swift] handleTimerEvent")
		websocketNotifier.handleTimerEvent()
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
