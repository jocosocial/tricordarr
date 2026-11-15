//
//  WebsocketNotifierGroup.swift
//  Tricordarr
//

import Foundation
import NetworkExtension
import os

/// The notification sockets of every account that should have one, as a single provider: one
/// `WebsocketNotifier` per account, started, stopped and health-checked together. The extension runs
/// one group (fed by the provider configuration) and the app runs another for when the extension
/// is not active (fed directly by `Notifications`).
public class WebsocketNotifierGroup: NSObject {
	/// NULL if the group is being used in-app.
	public var pushProvider: NEAppPushProvider?
	let isInApp: Bool
	/// TRUE between calls to Start and Stop. Tracks the provider's state, NOT the sockets themselves.
	private(set) var startState: Bool = false
	private var notifiers: [String: WebsocketNotifier] = [:]
	private let logger = Logging.getLogger("WebsocketNotifierGroup")

	public init(isInApp: Bool = false) {
		self.isInApp = isInApp
		super.init()
	}

	// MARK: - Configuration

	/// Extension context: take the accounts from the provider configuration.
	public func updateConfig() {
		let accounts = PushAccountConfig.list(
			from: pushProvider?.providerConfiguration?[PushManagerSettings.accountsKey]
		)
		setAccounts(accounts)
	}

	/// Makes the sockets match `accounts`: drops the ones no longer wanted, adds the new ones, and
	/// hands the rest their current token and preferences. A started group starts what it adds.
	func setAccounts(_ accounts: [PushAccountConfig]) {
		logger.log("[WebsocketNotifierGroup.swift] setAccounts with \(accounts.count, privacy: .public) accounts")
		let wanted = Set(accounts.map { $0.accountID })
		for (accountID, notifier) in notifiers where !wanted.contains(accountID) {
			notifier.stop(with: .superceded) {}
			notifiers[accountID] = nil
		}
		for account in accounts {
			let notifier = notifiers[account.accountID] ?? makeNotifier(accountID: account.accountID)
			notifier.showAccountName = accounts.count > 1
			notifier.updateConfig(account: account)
			if startState, !notifier.startState {
				notifier.start()
			}
		}
	}

	private func makeNotifier(accountID: String) -> WebsocketNotifier {
		let notifier = WebsocketNotifier(isInApp: isInApp)
		notifier.pushProvider = pushProvider
		notifiers[accountID] = notifier
		return notifier
	}

	// MARK: - Provider Lifecycle

	/// Start every account's socket.
	public func start() {
		logger.log("[WebsocketNotifierGroup.swift] start")
		startState = true
		notifiers.values.forEach { $0.start() }
	}

	/// Stop every account's socket.
	public func stop(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
		logger.log("[WebsocketNotifierGroup.swift] stop")
		startState = false
		notifiers.values.forEach { $0.stop(with: reason) {} }
		completionHandler()
	}

	/// Healthcheck every account's socket, reopening the ones that have gone away.
	public func handleTimerEvent() {
		notifiers.values.forEach { $0.handleTimerEvent() }
	}

	/// Replaces the in-app ping timers with the current healthcheck interval.
	func refreshPingTimer() {
		notifiers.values.forEach { $0.refreshPingTimer() }
	}

	// MARK: - Status

	/// The most recent time any of the sockets was heard from or checked.
	var lastPing: Date? {
		return notifiers.values.compactMap { $0.lastPing }.max()
	}

	/// The in-app healthcheck interval, which every socket shares.
	var socketPingInterval: TimeInterval? {
		return notifiers.values.compactMap { $0.socketPingTimer?.timeInterval }.first
	}
}
