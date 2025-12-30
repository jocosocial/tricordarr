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
		websocketNotifier.pushProvider = self
	}

	override func start() {
    logger.log("[LocalPushProvider.swift] start")
		websocketNotifier.updateConfig()
		websocketNotifier.start()
	}

	override func stop(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
    logger.log("[LocalPushProvider.swift] stop")
		websocketNotifier.stop(with: reason, completionHandler: completionHandler)
	}

	override func handleTimerEvent() {
		websocketNotifier.logger.log("[LocalPushProvider.swift] sleep")
		websocketNotifier.handleTimerEvent()
	}

	// NEProvider override
	override func sleep(completionHandler: @escaping () -> Void) {
		websocketNotifier.logger.log("[LocalPushProvider.swift] sleep")
		// Add code here to get ready to sleep.
		completionHandler()
	}

	// NEProvider override
	override func wake() {
		websocketNotifier.logger.log("[LocalPushProvider.swift] wake")
	}
}
