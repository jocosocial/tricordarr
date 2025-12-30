//
//  WebsocketNotifier.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/2/25.
//

import Foundation
import NetworkExtension
import os

public class WebsocketNotifier: NSObject {
	// Thread safety: All property access must go through accessQueue
	private let accessQueue = DispatchQueue(label: "com.tricordarr.websocketnotifier.access", qos: .userInitiated)

	public var pushProvider: NEAppPushProvider?  // NULL if notifier is being used in-app
	var session: URLSession?
	@objc dynamic var socket: URLSessionWebSocketTask?
	var lastPing: Date?
	// Internal logger to avoid direct field offset linker error with BUILD_LIBRARY_FOR_DISTRIBUTION
	// Making it internal (not public) prevents Swift from generating direct field offset symbols
	private let logger = Logging.getLogger("WebsocketNotifier")
	var startState: Bool = false  // TRUE between calls to Start and Stop. Tracks NEAppPushProvider's state, NOT the socket itself.
	var isInApp: Bool = false
	var incomingPhonecallHandler: (([AnyHashable: Any]) -> Void)?
	var socketPingTimer: Timer?
	var debugAddr: String = ""

	// Config values that can come from ProviderConfiguration. Must be non-nil to open socket
	private var serverURL: URL?
	private var token: String?

	public init(isInApp: Bool = false) {
		self.isInApp = isInApp
		super.init()
		debugAddr = Unmanaged.passUnretained(self).toOpaque().debugDescription
		logger.log(
			"KrakenPushProvider WebsocketNotifier.init() inApp: \(isInApp) addr: \(self.debugAddr, privacy: .public)"
		)
	}

	deinit {
		logger.log("KrakenPushProvider de-init. inApp: \(self.isInApp)")
	}

	// MARK: - Configuration

	// Don't call this from within websocketnotifier.
	public func updateConfig(serverURL: URL? = nil, token: String? = nil) {
		accessQueue.async { [weak self] in
			guard let self = self else { return }
			if let provider = self.pushProvider {
				if let config = provider.providerConfiguration, let twitarrStr = config["twitarrURL"] as? String,
					let token = config["token"] as? String,
					!twitarrStr.isEmpty, !token.isEmpty, let twitarrURL = URL(string: twitarrStr)
				{
					self.serverURL = twitarrURL
					self.token = token
				}
				else {
					self.serverURL = nil
					self.token = nil
				}
			}
			else {
				self.serverURL = serverURL
				self.token = token
				let shouldOpen = self.startState
				if shouldOpen {
					DispatchQueue.main.async {
						self.openWebSocket()
					}
				}
			}
		}
	}

	// MARK: - Open Socket

	/**
	 Opens a Websocket connection to the server and listens for events (messages). Implicitly does some things along the way to ensure
	 that all the necessary dependencies are satisfied (such as `URLSession`).
	 */
	func openWebSocket() {
		accessQueue.async { [weak self] in
			guard let self = self else { return }

			// No config == no socket.
			guard let twitarrURL = self.serverURL, let token = self.token, !token.isEmpty else {
				self.logger.error("[WebsocketNotifier.swift] openWebSocket essential configuration missing")
				return
			}

			// Make sure this instance has a `URLSession` (the `session`) member
			if self.session == nil {
				let config = URLSessionConfiguration.ephemeral
				// Kraken has `allowsCellularAccess` set to false. I am not convinced that is a good thing
				// for testing and using Twitarr out in the world which I often do. Testing at bars is great.
				// config.allowsCellularAccess = false
				config.waitsForConnectivity = true
				config.httpAdditionalHeaders = ["X-Swiftarr-Client": "Tricordarr \(Settings.shared.appVersion)"]
				self.session = .init(configuration: config, delegate: self, delegateQueue: nil)
			}

			if let existingSocket = self.socket, existingSocket.state == .running {
				self.logger.log("[WebsocketNotifier.swift] Not opening socket; existing one is already open.")
				return
			}

			self.logger.log(
				"[WebsocketNotifier.swift] Opening socket to \(twitarrURL.absoluteString, privacy: .public)"
			)
			var request = URLRequest(url: twitarrURL, cachePolicy: .useProtocolCachePolicy)
			request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

			// Build a new socket, make sure we actually have one, start (resume) it, and listen for messages
			let newSocket = self.session?.webSocketTask(with: request)
			if let socket = newSocket {
				self.socket = socket
				socket.resume()
				self.lastPing = Date()
				// Call receiveNextMessage on the main queue to avoid blocking the access queue
				DispatchQueue.main.async {
					self.receiveNextMessage()
				}
			}
			else {
				self.logger.error("[WebsocketNotifier.swift] openWebSocket didn't create a socket")
			}

			// The NEAppPushProvider framework calls `handleTimerEvent` every 60 seconds via `LocalPushProvider`.
			// When we're running a `WebsocketNotifier` outside of that context (aka Foreground mode) we set a
			// similar timer to perform healthcheck actions on the socket.
			if self.pushProvider == nil && self.socketPingTimer == nil {
				DispatchQueue.main.async {
					self.socketPingTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) {
						[weak self] timer in
						self?.handleTimerEvent()
					}
				}
			}
		}
	}

	// MARK: - Message/Event Processing

	private func generatePushNotificationFromEvent(_ socketNotification: SocketNotificationData) {
		var sendNotification = true
		var title = "From Tricordarr"
		var url = ""
		var markAsReadUrl: String? = nil

		guard let appConfig = AppConfig.shared else {
			self.logger.error("Could not get shared AppConfig")
			return
		}

		// Do not generate a notification if the user has disabled that category.
		if appConfig.pushNotifications[socketNotification.type] == false {
			self.logger
				.info(
					"[WebsocketNotifier.swift] user has disabled category \(socketNotification.type.rawValue, privacy: .public)"
				)
			return
		}

		// Do not generate a notification if the user has muted notifications.
		if let muteString = appConfig.muteNotifications {
			let formatter = ISO8601DateFormatter()
			formatter.formatOptions.insert(.withFractionalSeconds)
			if let muteUntil = formatter.date(from: muteString) {
				if Date() < muteUntil {
					self.logger.info(
						"[WebsocketNotifier.swift] user has muted notifications until \(muteUntil, privacy: .public)"
					)
					return
				}
			}
		}

		// Generate URL and markAsReadUrl based on notification type, matching JavaScript generatePushNotificationFromEvent
		switch socketNotification.type {
		case .seamailUnreadMsg:
			title = "New Seamail"
			url = "/seamail/\(socketNotification.contentID)"
			markAsReadUrl = "/fez/\(socketNotification.contentID)"

		case .fezUnreadMsg:
			title = "New LFG Message"
			url = "/lfg/\(socketNotification.contentID)/chat"
			markAsReadUrl = "/fez/\(socketNotification.contentID)"

		case .announcement:
			title = "Announcement"
			url = "/home"
			markAsReadUrl = "/notification/global"

		case .alertwordPost:
			title = "Forum Alert Word"
			url = "/forum/containingpost/\(socketNotification.contentID)"

		case .forumMention:
			title = "Forum Mention"
			url = "/forumpost/mentions"

		case .twitarrTeamForumMention:
			title = "TwitarrTeam Forum Mention"
			url = "/forum/containingpost/\(socketNotification.contentID)"

		case .moderatorForumMention:
			title = "Moderator Forum Mention"
			url = "/forum/containingpost/\(socketNotification.contentID)"

		case .incomingPhoneCall:
			if let caller = socketNotification.caller {
				title = "Incoming Call"
				url =
					"/phonecall/\(socketNotification.contentID)/from/\(caller.userID.uuidString)/\(caller.username)"
				self.incomingCallNotification(
					name: socketNotification.info,
					callID: socketNotification.contentID,
					userHeader: caller,
					callerAddr: socketNotification.callerAddress
				)
			}
			sendNotification = false

		case .phoneCallAnswered:
			sendNotification = false
			UserDefaults(suiteName: "group.com.challfry-FQD.Kraken")?
				.set(socketNotification.contentID, forKey: "phoneCallAnswered")
			self.logger.log("KrakenPushProvider set UserDefault for phoneCallAnswered")

		case .phoneCallEnded:
			sendNotification = false
			UserDefaults(suiteName: "group.com.challfry-FQD.Kraken")?
				.set(socketNotification.contentID, forKey: "phoneCallEnded")
			self.logger.log("KrakenPushProvider set UserDefault for phoneCallEnded")

		case .followedEventStarting:
			title = "Followed Event Starting"
			url = "/events/\(socketNotification.contentID)"

		case .joinedLFGStarting:
			title = "Joined LFG Starting"
			url = "/lfg/\(socketNotification.contentID)"

		case .personalEventStarting:
			title = "Personal Event Starting"
			url = "/privateevent/\(socketNotification.contentID)"

		case .addedToPrivateEvent:
			title = "Added to Private Event"
			url = "/privateevent/\(socketNotification.contentID)"

		case .addedToLFG:
			title = "Added to LFG"
			url = "/lfg/\(socketNotification.contentID)"

		case .addedToSeamail:
			title = "Added to Seamail"
			url = "/seamail/\(socketNotification.contentID)"

		case .privateEventCanceled:
			title = "Private Event Canceled"
			url = "/privateevent/\(socketNotification.contentID)"

		case .lfgCanceled:
			title = "LFG Canceled"
			url = "/lfg/\(socketNotification.contentID)"

		case .alertwordTwarrt:
			title = "Alert Word"
		// No URL defined in JavaScript for this type

		case .twarrtMention:
			title = "Someone Mentioned You"
		// No URL defined in JavaScript for this type

		case .privateEventUnreadMsg:
			title = "New Private Event Message"
			url = "/privateevent/\(socketNotification.contentID)"

		case .microKaraokeSongReady:
			title = "Micro Karaoke Music Video Ready"
		// No URL defined in JavaScript for this type

		@unknown default:
			break
		}

		if sendNotification {
			Notifications.generateContentNotification(
				UUID(),
				title: title,
				body: socketNotification.info,
				type: socketNotification.type,
				url: url,
				markAsReadUrl: markAsReadUrl
			)
		}
	}

	func receiveNextMessage() {
		accessQueue.async { [weak self] in
			guard let self = self else { return }
			guard let socket = self.socket else { return }

			socket.receive { [weak self] result in
				guard let self = self else { return }
				self.accessQueue.async {
					self.lastPing = Date()
					switch result {
					case .failure(let error):
						self.logger.error(
							"Error during websocket receive: \(error.localizedDescription, privacy: .public)"
						)
						socket.cancel(with: .goingAway, reason: nil)
						self.socket = nil
						self.session?.finishTasksAndInvalidate()
						self.session = nil
					case .success(let msg):
						self.logger.log("got a successful message. Instance: \(self.debugAddr, privacy: .public)")
						var msgData: Data?
						switch msg {
						case .string(let str):
							self.logger.log("STRING MESSAGE: \(str, privacy: .public)")
							msgData = str.data(using: .utf8)
						case .data(let data):
							// @TODO uhh, is this logging every call audio packet?
							self.logger.log("DATA MESSAGE: \(data, privacy: .public)")
							msgData = data
						@unknown default:
							self.logger.error("Error during websocket receive: Unknown ws data type delivered.)")
						}
						if let msgData = msgData,
							let socketNotification = try? JSONDecoder()
								.decode(SocketNotificationData.self, from: msgData)
						{
							// Process notification off the queue to avoid blocking
							DispatchQueue.main.async {
								self.generatePushNotificationFromEvent(socketNotification)
							}
						}
						else {
							self.logger.error("Error during websocket receive: Looks like we couldn't parse the data?)")
						}
					}
					// Continue receiving on the main queue
					DispatchQueue.main.async {
						self.receiveNextMessage()
					}
				}
			}
		}
	}

	func incomingCallNotification(
		name: String,
		callID: String,
		userHeader: UserHeader,
		callerAddr: PhoneSocketServerAddress?
	) {
		logger.log("Incoming call")
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
		accessQueue.async { [weak self] in
			guard let self = self else { return }
			if let provider = self.pushProvider {
				provider.reportIncomingCall(userInfo: dict)
			}
			else {
				// This optional block exists so our in-app socket can deliver an incoming phone call without linking anything new into the extension.
				self.incomingPhonecallHandler?(dict)
			}
		}
	}

	// MARK: - Provider Lifecycle

	/**
	 Start the websocket.
	 */
	public func start() {
		accessQueue.async { [weak self] in
			guard let self = self else { return }
			let providerLogTerm = "\(self.isInApp ? "Foreground" : "Background") Provider"

			if self.startState == true {
				self.logger.log("[WebsocketNotifier.swift] start called while already started")
			}
			else if self.serverURL == nil {
				self.logger.log(
					"[WebsocketNotifier.swift] \(providerLogTerm) can't start -- no server URL"
				)
			}
			else if self.token == nil || self.token == "" {
				self.logger.log(
					"[WebsocketNotifier.swift] \(providerLogTerm) can't start -- no user token"
				)
			}
			else {
				self.logger.log("[WebsocketNotifier.swift] \(providerLogTerm) start")
			}
			self.startState = true
			DispatchQueue.main.async {
				self.openWebSocket()
			}
		}
	}

	/**
	 Stop and shutdown the websocket. We need to do this quickly and quietly in cases where the phone switches/loses wifi.
	 */
	public func stop(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
		accessQueue.async { [weak self] in
			guard let self = self else {
				completionHandler()
				return
			}
			self.logger.log("[WebsocketNotifier.swift] stop called")
			self.socket?.cancel(with: .goingAway, reason: nil)
			self.socket = nil
			self.session?.finishTasksAndInvalidate()
			self.startState = false
			// Timer invalidation must happen on the thread that created it (main thread)
			if let timer = self.socketPingTimer {
				DispatchQueue.main.async {
					timer.invalidate()
				}
			}
			self.socketPingTimer = nil
			completionHandler()
		}
	}

	/**
	 Websocket healthcheck function. This is triggered periodically by timers (set by us or automagically by the Local Push framework).
	 If the socket is unhealthy/nonexistant this should jumpstart it.
	 */
	public func handleTimerEvent() {
		accessQueue.async { [weak self] in
			guard let self = self else { return }

			if let pingTime = self.lastPing, Date().timeIntervalSince(pingTime) < 1.0 {
				self.logger.warning(
					"[WebsocketNotifier.swift] HandleTimerEvent called with very low delay from last call."
				)
				return
			}
			else if self.startState == false {
				self.logger.warning("[WebsocketNotifier.swift] HandleTimerEvent called while in stop state.")
				return
			}
			self.logger.log(
				"[WebsocketNotifier.swift] HandleTimerEvent called for instance \(String(format: "%p", self), privacy: .public)"
			)
			self.logger.log(
				"[WebsocketNotifier.swift] lastPing: \(self.lastPing?.debugDescription ?? "<nil>", privacy: .public)"
			)

			self.lastPing = Date()

			// You're supposed to be alive at this point
			let socket = self.socket
			let shouldOpen = socket == nil && self.startState == true
			if shouldOpen {
				DispatchQueue.main.async {
					self.openWebSocket()
				}
			}

			if let socket = socket {
				socket.sendPing { [weak self] error in
					guard let self = self else { return }
					if let err = error {
						self.accessQueue.async {
							self.logger
								.error(
									"[WebsocketNotifier.swift] Error during ping to server: \(err.localizedDescription, privacy: .public)"
								)
							self.socket?.cancel(with: .goingAway, reason: nil)
							self.socket = nil
							DispatchQueue.main.async {
								self.start()
							}
						}
					}
				}
			}
		}
	}
}

// MARK: - URLSession Overrides

// Delegate methods for the session itself
extension WebsocketNotifier: URLSessionDelegate {
	public func urlSession(_ session: URLSession, didBecomeInvalidWithError error: Error?) {
		logger.log("[WebsocketNotifier.swift] Session went invalid because: \(error, privacy: .public)")
		accessQueue.async { [weak self] in
			self?.session = nil
		}
	}
}

// Delegate methods for the session's Tasks -- common to all task types
extension WebsocketNotifier: URLSessionTaskDelegate {
	public func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
		logger.log(
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
		logger.log("[WebsocketNotifier.swift] Notifier Socket task received willPerformHTTPRedirection")
		completionHandler(request)
	}

	public func urlSession(
		_ session: URLSession,
		task: URLSessionTask,
		didReceive challenge: URLAuthenticationChallenge,
		completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
	) {
		logger.log(
			"[WebsocketNotifier.swift] Notifier Socket task received URLAuthenticationChallenge of type \(challenge.protectionSpace.authenticationMethod)."
		)
		completionHandler(.performDefaultHandling, nil)
	}
}

/// Delegate methods for WebSocket tasks
extension WebsocketNotifier: URLSessionWebSocketDelegate {
	public func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol: String?)
	{
		logger.log(
			"[WebsocketNotifier.swift] Socket opened with protocol: \(didOpenWithProtocol ?? "<unknown>", privacy: .public)"
		)
	}

	public func urlSession(
		_ session: URLSession,
		webSocketTask: URLSessionWebSocketTask,
		didCloseWith: URLSessionWebSocketTask.CloseCode,
		reason: Data?
	) {
		logger.log("[WebsocketNotifier.swift] Socket closed with code: \(didCloseWith.rawValue)")
		accessQueue.async { [weak self] in
			self?.socket?.cancel(with: .goingAway, reason: nil)
			self?.socket = nil
		}
	}
}

// MARK: - Sendable Conformance
extension WebsocketNotifier: @unchecked Sendable {}
