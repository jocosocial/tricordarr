//
//  LocalPushProvider.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/2/25.
//

import Foundation
import NetworkExtension

/// Local Push Connectivity provider. The lifecycle of this class is automagically managed by the NEAppPushManager.
/// It will start/stop when the device is on certain pre-configured wifi networks.
class LocalPushProvider: NEAppPushProvider {
	var websocketNotifier = WebsocketNotifier()

	override init() {
		super.init()
		websocketNotifier.pushProvider = self
	}

	override func start() {
		websocketNotifier.updateConfig()
		websocketNotifier.start()
	}

	override func stop(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
		websocketNotifier.stop(with: reason, completionHandler: completionHandler)
	}

	override func handleTimerEvent() {
		websocketNotifier.handleTimerEvent()
	}

	// NEProvider override
	override func sleep(completionHandler: @escaping () -> Void) {
		websocketNotifier.logger.log("sleep() called")
		// Add code here to get ready to sleep.
		completionHandler()
	}

	// NEProvider override
	override func wake() {
		websocketNotifier.logger.log("wake() called")
	}

}
