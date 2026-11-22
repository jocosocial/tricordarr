//
//  WebsocketNotifier.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/2/25.
//

import Foundation
import NetworkExtension
import os
import UserNotifications

/// Mirrors the states shown on the Android side's `WebSocketState` enum (`src/Libraries/Network/Websockets.ts`).
enum WebsocketConnectionState: String {
	case uninitialized = "Uninitialized"
	case connecting = "Connecting"
	case open = "Open"
	case closing = "Closing"
	case closed = "Closed"
}

/// One account's notification socket. `WebsocketNotifierGroup` owns one of these per account.
public class WebsocketNotifier: NSObject {
	public var pushProvider: NEAppPushProvider?  // NULL if notifier is being used in-app @TODO LocalPushProvider
	var session: URLSession?
	@objc dynamic var socket: URLSessionWebSocketTask?
	var lastPing: Date?
	let logger = Logging.getLogger("WebsocketNotifier")
	var startState: Bool = false  // TRUE between calls to Start and Stop. Tracks NEAppPushProvider's state, NOT the socket itself.
	var isInApp: Bool = false
	var incomingPhonecallHandler: (([AnyHashable: Any]) -> Void)?
	var socketPingTimer: Timer?
	var debugAddr: String = ""

	/// The account this socket is for. Must be non-nil to open the socket.
	private(set) var account: PushAccountConfig?
	/// Whether notifications name their account, which only matters when several are connected.
	var showAccountName: Bool = false

	public init(isInApp: Bool = false) {
		self.isInApp = isInApp
		super.init()
		debugAddr = Unmanaged.passUnretained(self).toOpaque().debugDescription
    self.logger.log(
			"[WebsocketNotifier.swift] WebsocketNotifier.init() inApp: \(isInApp) addr: \(self.debugAddr, privacy: .public)"
		)
	}

	deinit {
    self.logger.log("[WebsocketNotifier.swift] de-init. inApp: \(self.isInApp)")
	}

	// MARK: - Socket Status Persistence

	static let appGroupSuiteName = "group.com.grantcohoe.tricordarr"

	private static let statusKeyPrefix = "ws_"

	/// The App Group `UserDefaults` key of one status field of one account's socket.
	private static func statusKey(_ field: String, accountID: String) -> String {
		return "\(statusKeyPrefix)\(field).\(accountID)"
	}

	/// Persists the socket's connection state and/or healthcheck (ping) results to the shared App Group
	/// `UserDefaults` suite so the main app process can read it regardless of whether the extension or the
	/// in-app provider currently owns the socket. Only one of those runs an account's socket at a time, so
	/// a single shared record per account is sufficient.
	private func persistSocketStatus(
		state: WebsocketConnectionState? = nil, healthcheckSuccess: Bool? = nil, error: String? = nil
	) {
		guard let accountID = account?.accountID,
			let defaults = UserDefaults(suiteName: Self.appGroupSuiteName)
		else { return }
		let now = Date().timeIntervalSince1970 * 1000
		if let state = state {
			defaults.set(state.rawValue, forKey: Self.statusKey("state", accountID: accountID))
		}
		if let healthcheckSuccess = healthcheckSuccess {
			defaults.set(healthcheckSuccess, forKey: Self.statusKey("last_healthcheck_success", accountID: accountID))
			defaults.set(now, forKey: Self.statusKey("last_healthcheck_at", accountID: accountID))
		}
		if let error = error {
			defaults.set(error, forKey: Self.statusKey("last_error", accountID: accountID))
			defaults.set(now, forKey: Self.statusKey("last_error_at", accountID: accountID))
		}
	}

	/// The persisted status of one account's socket, whichever process is running it.
	static func persistedStatus(accountID: String) -> WebsocketStatus {
		let defaults = UserDefaults(suiteName: appGroupSuiteName)
		return WebsocketStatus(
			accountID: accountID,
			state: defaults?.string(forKey: statusKey("state", accountID: accountID)),
			lastHealthcheckAt: defaults?.object(forKey: statusKey("last_healthcheck_at", accountID: accountID)) as? Double,
			lastHealthcheckSuccess: defaults?.object(forKey: statusKey("last_healthcheck_success", accountID: accountID))
				as? Bool,
			lastError: defaults?.string(forKey: statusKey("last_error", accountID: accountID)),
			lastErrorAt: defaults?.object(forKey: statusKey("last_error_at", accountID: accountID)) as? Double
		)
	}

	/// Forgets the persisted status of every account not in `accountIDs`, including the single
	/// un-keyed record written before sockets were per account.
	static func prunePersistedStatus(keeping accountIDs: Set<String>) {
		guard let defaults = UserDefaults(suiteName: appGroupSuiteName) else { return }
		for key in defaults.dictionaryRepresentation().keys where key.hasPrefix(statusKeyPrefix) {
			let accountID = key.split(separator: ".", maxSplits: 1).dropFirst().first.map(String.init)
			if accountID == nil || !accountIDs.contains(accountID!) {
				defaults.removeObject(forKey: key)
			}
		}
	}

	// MARK: - Debug lifecycle notifications

	/// Posts a local debug notification only when developer mode is enabled.
	/// - Parameters:
	///   - providerConfiguration: When non-nil (extension context), developer mode is read from this dict. When nil (app context), uses AppConfig.shared.
	///   - title: Notification title.
	///   - body: Notification body.
	public static func postDebugLifecycleNotification(
		providerConfiguration: [String: Any]?,
		title: String,
		body: String
	) {
		let developerModeEnabled: Bool
		if let config = providerConfiguration {
			developerModeEnabled = (config["enableDeveloperOptions"] as? Bool) == true
		} else {
			developerModeEnabled = AppConfig.shared?.enableDeveloperOptions == true
		}
		guard developerModeEnabled else { return }

		let content = UNMutableNotificationContent()
		content.title = title
		content.body = body
		content.sound = .default
		let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
		UNUserNotificationCenter.current().add(request) { _ in }
	}

	// MARK: - Configuration

	/// Sets the account this socket is for. A change of server or token reopens a running socket;
	/// a change of preferences alone just takes effect on the next event.
	/// Don't call this from within websocketnotifier.
	func updateConfig(account: PushAccountConfig?) {
		self.logger.log("[WebsocketNotifier.swift] updateConfig")
		let reconnect = account?.connectionDiffers(from: self.account) ?? true
		self.account = account
		guard startState == true, reconnect else { return }
		socket?.cancel(with: .goingAway, reason: nil)
		socket = nil
		openWebSocket()
	}

	/**
	 Configures a `URLSession` for an instance of this class to use. Manages all web requests under one context roof.
	 */
	private func configureURLSession() {
    self.logger.log("[WebsocketNotifier.swift] configureURLSession")
		if session == nil {
			let config = URLSessionConfiguration.ephemeral
			// Kraken has `allowsCellularAccess` set to false. I am not convinced that is a good thing
			// for testing and using Twitarr out in the world which I often do. Testing at bars is great.
			// config.allowsCellularAccess = false
			config.waitsForConnectivity = true
			config.httpAdditionalHeaders = [
				"X-Swiftarr-Client": "\(Settings.shared.appName) \(Settings.shared.appVersion)",
				"Cache-Control": "no-store",
			]
			session = .init(configuration: config, delegate: self, delegateQueue: nil)
		}
	}

	// MARK: - Open Socket

	/**
	 Opens a Websocket connection to the server and listens for events (messages). Implicitly does some things along the way to ensure
	 that all the necessary dependencies are satisfied (such as `URLSession`).
	 */
	func openWebSocket() {
    self.logger.log("[WebsocketNotifier.swift] openWebSocket")
		// No config == no socket.
		guard let account = self.account, let twitarrURL = account.socketURL else {
			self.logger.error("[WebsocketNotifier.swift] openWebSocket essential configuration missing")
			return
		}

		// Make sure this instance has a `URLSession` (the `session`) member
		configureURLSession()

		if let existingSocket = socket, existingSocket.state == .running {
			self.logger.log("[WebsocketNotifier.swift] Not opening socket; existing one is already open.")
			return
		}

		self.logger.log("[WebsocketNotifier.swift] Opening socket to \(twitarrURL.absoluteString, privacy: .public)")
		persistSocketStatus(state: .connecting)
		var request = URLRequest(url: twitarrURL, cachePolicy: .useProtocolCachePolicy)
		request.addValue("Bearer \(account.token)", forHTTPHeaderField: "Authorization")

		// Build a new socket, make sure we actually have one, start (resume) it, and listen for messages
		socket = session?.webSocketTask(with: request)
		if let socket = socket {
			socket.resume()
			lastPing = Date()
			receiveNextMessage()
		}
		else {
			self.logger.error("[WebsocketNotifier.swift] openWebSocket didn't create a socket")
		}

		// The NEAppPushProvider framework calls `handleTimerEvent` every 60 seconds via `LocalPushProvider`.
		// When we're running a `WebsocketNotifier` outside of that context (aka Foreground mode) we set a
		// similar timer to perform healthcheck actions on the socket.
		if pushProvider == nil && socketPingTimer == nil {
			let pingIntervalSeconds = Double(AppConfig.shared?.fgsWorkerHealthTimer ?? 10000) / 1000.0
      self.logger
        .log(
          "[WebsocketNotifier.swift] setting up new socketPingTimer at interval \(pingIntervalSeconds, privacy: .public)"
        )
      socketPingTimer = Timer(timeInterval: pingIntervalSeconds, repeats: true) { [weak self] timer in
				self?.handleTimerEvent()
			}
			// Explicitly schedule on main run loop to ensure timer fires regardless of calling thread
			if let timer = socketPingTimer {
				RunLoop.main.add(timer, forMode: .common)
			}
		}
	}

	/// Replaces the foreground ping timer with the current `fgsWorkerHealthTimer` interval.
	/// No-op when running as a background extension or when the provider is stopped.
	func refreshPingTimer() {
		guard pushProvider == nil else { return }
		guard startState else { return }

		let pingIntervalSeconds = Double(AppConfig.shared?.fgsWorkerHealthTimer ?? 10000) / 1000.0
		self.logger.log(
			"[WebsocketNotifier.swift] refreshPingTimer: updating interval to \(pingIntervalSeconds, privacy: .public)s"
		)

		socketPingTimer?.invalidate()
		socketPingTimer = Timer(timeInterval: pingIntervalSeconds, repeats: true) { [weak self] _ in
			self?.handleTimerEvent()
		}
		if let timer = socketPingTimer {
			RunLoop.main.add(timer, forMode: .common)
		}
	}

	// MARK: - Message/Event Processing

	private func generatePushNotificationFromEvent(_ socketNotification: SocketNotificationData) {
		self.logger.log("[WebsocketNotifier.swift] generatePushNotificationFromEvent")

		// Each account is filtered with its own preferences: the category toggles and the mute time.
		// Call signalling has no toggle and never posts, so it is not filtered.
		if !socketNotification.type.isSignal, account?.allowsNotification(socketNotification.type) == false {
			self.logger
				.log(
					"[WebsocketNotifier.swift] user has disabled or muted \(socketNotification.type.rawValue, privacy: .public)"
				)
			return
		}

		// Phone calls are handled here rather than through the generated event table.
		switch socketNotification.type {
		case .incomingPhoneCall:
			if let caller = socketNotification.caller {
				self.incomingCallNotification(
					name: socketNotification.info,
					callID: socketNotification.contentID,
					userHeader: caller,
					callerAddr: socketNotification.callerAddress
				)
			}
			return

		// CallKit is driven by the app's CallProvider from its own socket, which handles these. There
		// is nothing to post.
		case .phoneCallAnswered, .phoneCallEnded:
			return

		default:
			break
		}

		// Types with no entry in specs/NotificationEvents.json do not post.
		guard let spec = socketNotification.type.eventSpec else { return }
		let title = spec.title
		let url = Self.expandTemplate(spec.url, contentID: socketNotification.contentID) ?? ""
		let markAsReadUrl = Self.expandTemplate(spec.markAsReadUrl, contentID: socketNotification.contentID)

		let pushAccount = self.account
		let accountName = showAccountName ? pushAccount?.username : nil
		// Chat events with an author post as communication notifications, showing the sender's avatar.
		// The avatar may need a fetch, so the work runs on NotificationAvatar's serial queue, which keeps
		// posts in socket order without blocking the receive loop.
		let sender = spec.messaging ? socketNotification.author : nil
		NotificationAvatar.queue.async {
			let avatar = sender.flatMap { author in
				pushAccount.map { NotificationAvatar.image(for: author, serverUrl: $0.serverUrl, urlPrefix: $0.urlPrefix) }
			}
			Notifications.generateContentNotification(
				socketNotification.contentID,
				title: title,
				body: MarkdownText.plainText(socketNotification.info),
				type: socketNotification.type,
				url: url,
				markAsReadUrl: markAsReadUrl,
				secondaryContentID: socketNotification.secondaryContentID,
				accountID: pushAccount?.accountID,
				accountName: accountName,
				sender: sender,
				senderAvatar: avatar
			)
		}
	}

	/// Substitutes `{contentID}` in a URL template from the generated event table. Only that placeholder is
	/// needed here; the call URL is built in the phone-call branch.
	private static func expandTemplate(_ template: String?, contentID: String) -> String? {
		template?.replacingOccurrences(of: "{contentID}", with: contentID)
	}

	func receiveNextMessage() {
    self.logger.log("[WebsocketNotifier.swift] receiveNextMessage")
		if let socket = socket {
			socket.receive { [weak self] result in
				guard let self = self else { return }
				self.lastPing = Date()
				switch result {
				case .failure(let error):
					self.logger.error(
						"[WebsocketNotifier.swift] Error during websocket receive: \(error.localizedDescription, privacy: .public)"
					)
					socket.cancel(with: .goingAway, reason: nil)
					// A socket that was replaced (new token, failed ping) reports its end here too, and
					// must not take its replacement down with it.
					guard self.socket === socket else { return }
					self.persistSocketStatus(state: .closed, error: error.localizedDescription)
					self.socket = nil
					self.session?.finishTasksAndInvalidate()
					self.session = nil
				case .success(let msg):
					self.logger.log(
						"[WebsocketNotifier.swift] got a successful message. Instance: \(debugAddr, privacy: .public)"
					)
					var msgData: Data?
					switch msg {
					case .string(let str):
						self.logger.log("[WebsocketNotifier.swift] STRING MESSAGE: \(str, privacy: .public)")
						msgData = str.data(using: .utf8)
					case .data(let data):
						// @TODO uhh, is this logging every call audio packet?
						self.logger.log("[WebsocketNotifier.swift] DATA MESSAGE: \(data, privacy: .public)")
						msgData = data
					@unknown default:
						self.logger.error(
							"[WebsocketNotifier.swift] Error during websocket receive: Unknown ws data type delivered.)"
						)
					}
					if let msgData = msgData,
						let socketNotification = try? JSONDecoder().decode(SocketNotificationData.self, from: msgData)
					{
						// Record before generating the push notification so the log reflects every
						// event the socket delivered, including ones suppressed by mute/category settings.
						NotificationLog.append(socketNotification, raw: msgData, accountID: self.account?.accountID)
						self.generatePushNotificationFromEvent(socketNotification)
					}
					else {
						self.logger.error(
							"[WebsocketNotifier.swift] Error during websocket receive: Looks like we couldn't parse the data?)"
						)
					}
				}
				self.receiveNextMessage()
			}
		}
	}

	func incomingCallNotification(
		name: String,
		callID: String,
		userHeader: UserHeader,
		callerAddr: PhoneSocketServerAddress?
	) {
    self.logger.log("Incoming call")
		var dict =
			[
				"name": name, "callID": callID, "callerID": userHeader.userID.uuidString,
				"username": userHeader.username,
			] as [String: Any]
		if let ipv4Addr = callerAddr?.ipV4Addr {
			dict["ipv4Addr"] = ipv4Addr
		}
		if let ipv6Addr = callerAddr?.ipV6Addr {
			dict["ipv6Addr"] = ipv6Addr
		}
		if let displayName = userHeader.displayName {
			dict["displayName"] = displayName
		}
		if let userImage = userHeader.userImage {
			dict["userImage"] = userImage
		}
		if let provider = pushProvider {
			provider.reportIncomingCall(userInfo: dict)
		}
		else {
			// This optional block exists so our in-app socket can deliver an incoming phone call without linking anything new into the extension.
			incomingPhonecallHandler?(dict)
		}
	}

	// MARK: - Provider Lifecycle

	/**
	 Start the websocket.
	 */
	public func start() {
    self.logger.log("[WebsocketNotifier.swift] start")
		let providerLogTerm = "\(self.isInApp ? "Foreground" : "Background") Provider"

		if startState == true {
      self.logger.log("[WebsocketNotifier.swift] start called while already started")
		}
		else if self.account == nil {
      self.logger.log(
				"[WebsocketNotifier.swift] \(providerLogTerm) can't start -- no account"
			)
		}
		else {
      self.logger.log("[WebsocketNotifier.swift] \(providerLogTerm) start")
		}
		startState = true
		openWebSocket()
		if isInApp {
			WebsocketNotifier.postDebugLifecycleNotification(
				providerConfiguration: nil,
				title: "Foreground provider started",
				body: "In-app push provider is running."
			)
		}
	}

	/**
	 Stop and shutdown the websocket. We need to do this quickly and quietly in cases where the phone switches/loses wifi.
	 */
	public func stop(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
    self.logger.log("[WebsocketNotifier.swift] stop called")
		if isInApp {
			WebsocketNotifier.postDebugLifecycleNotification(
				providerConfiguration: nil,
				title: "Foreground provider stopped",
				body: "In-app push provider has stopped."
			)
		}
		persistSocketStatus(state: .closed)
		socket?.cancel(with: .goingAway, reason: nil)
		socket = nil
		session?.finishTasksAndInvalidate()
		startState = false
		socketPingTimer?.invalidate()
		socketPingTimer = nil
		completionHandler()
	}

	/**
	 Websocket healthcheck function. This is triggered periodically by timers (set by us or automagically by the Local Push framework).
	 If the socket is unhealthy/nonexistant this should jumpstart it.
	 */
	public func handleTimerEvent() {
    self.logger.log("[WebsocketNotifier.swift] handleTimerEvent")
		if let pingTime = lastPing, Date().timeIntervalSince(pingTime) < 1.0 {
      self.logger.warning("[WebsocketNotifier.swift] HandleTimerEvent called with very low delay from last call.")
			return
		}
		else if startState == false {
      self.logger.warning("[WebsocketNotifier.swift] HandleTimerEvent called while in stop state.")
			return
		}
    self.logger.log(
			"[WebsocketNotifier.swift] HandleTimerEvent called for instance \(String(format: "%p", self), privacy: .public)"
		)
    self.logger.log(
			"[WebsocketNotifier.swift] lastPing: \(self.lastPing?.debugDescription ?? "<nil>", privacy: .public)"
		)

		lastPing = Date()

		// You're supposed to be alive at this point
		if socket == nil, startState == true {
			openWebSocket()
		}
		socket?
			.sendPing { [weak self] error in
				if let err = error {
					self?.logger
						.error(
							"[WebsocketNotifier.swift] Error during ping to server: \(err.localizedDescription, privacy: .public)"
						)
					self?.persistSocketStatus(healthcheckSuccess: false, error: err.localizedDescription)
					self?.socket?.cancel(with: .goingAway, reason: nil)
					self?.socket = nil
					self?.start()
				}
				else {
					self?.persistSocketStatus(healthcheckSuccess: true)
				}
			}
	}
}

// MARK: - URLSession Overrides

// Delegate methods for the session itself
extension WebsocketNotifier: URLSessionDelegate {
	public func urlSession(_ session: URLSession, didBecomeInvalidWithError error: Error?) {
    self.logger.log("[WebsocketNotifier.swift] Session went invalid because: \(error, privacy: .public)")
		self.session = nil
	}
}

// Delegate methods for the session's Tasks -- common to all task types
extension WebsocketNotifier: URLSessionTaskDelegate {
	public func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
    self.logger.log(
			"[WebsocketNotifier.swift] Notifier Socket task received didCompleteWithError: \(error, privacy: .public)"
		)
	}

	public func urlSession(
		_ session: URLSession,
		task: URLSessionTask,
		willPerformHTTPRedirection response: HTTPURLResponse,
		newRequest request: URLRequest,
		completionHandler: @escaping (URLRequest?) -> Void
	) {
    self.logger.log("[WebsocketNotifier.swift] Notifier Socket task received willPerformHTTPRedirection")
		completionHandler(request)
	}

	public func urlSession(
		_ session: URLSession,
		task: URLSessionTask,
		didReceive challenge: URLAuthenticationChallenge,
		completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
	) {
    self.logger.log(
			"[WebsocketNotifier.swift] Notifier Socket task received URLAuthenticationChallenge of type \(challenge.protectionSpace.authenticationMethod)."
		)
		completionHandler(.performDefaultHandling, nil)
	}
}

/// Delegate methods for WebSocket tasks
extension WebsocketNotifier: URLSessionWebSocketDelegate {
	public func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol: String?)
	{
    let debugUrl = webSocketTask.currentRequest?.url?.absoluteString ?? "unknown"
    self.logger.log(
      "[WebsocketNotifier.swift] Socket opened with protocol: \(didOpenWithProtocol ?? "<unknown>", privacy: .public) to \(debugUrl, privacy: .public)"
		)
		guard socket === webSocketTask else { return }
		persistSocketStatus(state: .open)
	}

	public func urlSession(
		_ session: URLSession,
		webSocketTask: URLSessionWebSocketTask,
		didCloseWith: URLSessionWebSocketTask.CloseCode,
		reason: Data?
	) {
    self.logger.log("[WebsocketNotifier.swift] Socket closed with code: \(didCloseWith.rawValue)")
		webSocketTask.cancel(with: .goingAway, reason: nil)
		// Only the current socket's close is this account's status; see receiveNextMessage.
		guard socket === webSocketTask else { return }
		persistSocketStatus(state: .closed)
		socket = nil
	}
}
