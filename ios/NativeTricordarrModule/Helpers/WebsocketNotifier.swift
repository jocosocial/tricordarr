//
//  WebsocketNotifier.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/2/25.
//

import Foundation
import NetworkExtension
import os

@objc class WebsocketNotifier: NSObject {
	var pushProvider: LocalPushProvider?  // NULL if notifier is being used in-app
	var session: URLSession?
	@objc dynamic var socket: URLSessionWebSocketTask?
	var lastPing: Date?
	let logger = Logging.getLogger("WebsocketNotifier")
	var startState: Bool = false  // TRUE between calls to Start and Stop. Tracks NEAppPushProvider's state, NOT the socket itself.
	var isInApp: Bool = false
	var incomingPhonecallHandler: (([AnyHashable: Any]) -> Void)?
	var socketPingTimer: Timer?
	var debugAddr: String = ""

	// Config values that can come from ProviderConfiguration. Must be non-nil to open socket
	private var serverURL: URL?
	private var token: String?

	init(isInApp: Bool = false) {
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

	// Don't call this from within websocketnotifier.
	func updateConfig(serverURL: URL? = nil, token: String? = nil) {
		if let provider = pushProvider {
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
			if startState == true {
				openWebSocket()
			}
		}
	}

	func start() {
		if startState == true {
			logger.log("KrakenPushProvider start() called while already started.")
		}
		else if self.serverURL == nil {
			logger.log(
				"KrakenPushProvider \(self.isInApp ? "In-App" : "Extension", privacy: .public) can't start -- no server URL"
			)
		}
		else if self.token == nil || token == "" {
			logger.log(
				"KrakenPushProvider \(self.isInApp ? "In-App" : "Extension", privacy: .public) can't start -- no user token"
			)
		}
		else {
			logger.log("KrakenPushProvider \(self.isInApp ? "In-App" : "Extension", privacy: .public) start()")
		}
		startState = true
		openWebSocket()
	}

	func openWebSocket() {
		guard let twitarrURL = self.serverURL, let token = self.token, !token.isEmpty else {
			return
		}
		if session == nil {
			let config = URLSessionConfiguration.ephemeral
			config.allowsCellularAccess = false
			config.waitsForConnectivity = true
			let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
			config.httpAdditionalHeaders = ["X-Swiftarr-Client": "Kraken \(appVersion)"]
			session = .init(configuration: config, delegate: self, delegateQueue: nil)
		}
		if let existingSocket = socket, existingSocket.state == .running {
			self.logger.log("Not opening socket; existing one is already open.")
			return
		}

		self.logger.log("Opening socket to \(twitarrURL.absoluteString, privacy: .public)")
		var request = URLRequest(url: twitarrURL, cachePolicy: .useProtocolCachePolicy)
		request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
		socket = session?.webSocketTask(with: request)
		if let socket = socket {
			socket.resume()
			lastPing = Date()
			receiveNextMessage()
		}
		else {
			self.logger.log("openWebSocket didn't create a socket.")
		}

		if pushProvider == nil && socketPingTimer == nil {
			socketPingTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] timer in
				self?.handleTimerEvent()
			}
		}
	}

	func receiveNextMessage() {
		if let socket = socket {
			socket.receive { [weak self] result in
				guard let self = self else { return }
				//        self.logger.log("Got some data incoming!!!! ")
				self.lastPing = Date()
				switch result {
				case .failure(let error):
					self.logger.error("Error during websocket receive: \(error.localizedDescription, privacy: .public)")
					socket.cancel(with: .goingAway, reason: nil)
					self.socket = nil
					self.session?.finishTasksAndInvalidate()
					self.session = nil
				case .success(let msg):
					self.logger.log("got a successful message. Instance: \(debugAddr, privacy: .public)")
					var msgData: Data?
					switch msg {
					case .string(let str):
						self.logger.log("STRING MESSAGE: \(str, privacy: .public)")
						msgData = str.data(using: .utf8)
					case .data(let data):
						self.logger.log("DATA MESSAGE: \(data, privacy: .public)")
						msgData = data
					@unknown default:
						self.logger.error("Error during websocket receive: Unknown ws data type delivered.)")
					}
					if let msgData = msgData,
						let socketNotification = try? JSONDecoder().decode(SocketNotificationData.self, from: msgData)
					{
						var sendNotification = true
						var title = "From Kraken"
						var userInfo: [String: Any] = [
							//                "type": socketNotification.type.rawValue,
							"message": socketNotification.info
						]
						switch socketNotification.type {
						case .announcement:
							title = "Announcement"
							userInfo["Announcement"] = socketNotification.contentID

						case .addedToSeamail:
							title = "Added to Seamail"
							userInfo["Seamail"] = socketNotification.contentID
						case .addedToLFG:
							title = "Added to LFG"
							userInfo["LFG"] = socketNotification.contentID
						case .addedToPrivateEvent:
							title = "Added to Private Event"
							userInfo["PrivateEvent"] = socketNotification.contentID

						case .fezUnreadMsg:
							title = "New Looking For Group Message"
							userInfo["LFG"] = socketNotification.contentID
						case .seamailUnreadMsg:
							title = "New Seamail Message"
							userInfo["Seamail"] = socketNotification.contentID
						case .privateEventUnreadMsg:
							title = "New Private Event Message"
							userInfo["PrivateEvent"] = socketNotification.contentID

						case .alertwordTwarrt:
							title = "Alert Word"
							userInfo["Twarrt"] = socketNotification.contentID
						case .alertwordPost:
							title = "Alert Word"
							userInfo["ForumPost"] = socketNotification.contentID
						case .twarrtMention:
							title = "Someone Mentioned You"
							userInfo["Twarrt"] = socketNotification.contentID
						case .forumMention:
							title = "Someone Mentioned You"
							userInfo["ForumPost"] = socketNotification.contentID
						case .moderatorForumMention:
							break
						case .twitarrTeamForumMention:
							break

						case .followedEventStarting:
							title = "Event Starting Soon"
							userInfo["eventID"] = socketNotification.contentID
						case .joinedLFGStarting:
							userInfo["LFG"] = socketNotification.contentID
						case .personalEventStarting:
							break

						case .incomingPhoneCall:
							if let caller = socketNotification.caller {
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

						case .microKaraokeSongReady:
							title = "Micro Karaoke Music Video Ready"
							userInfo["mkSongID"] = socketNotification.contentID
						case .privateEventCanceled:
							title = "Private Event Canceled"
							userInfo["PrivateEvent"] = socketNotification.contentID
						case .lfgCanceled:
							title = "LFG Canceled"
							userInfo["LFG"] = socketNotification.contentID
						@unknown default:
							break
						}
						if sendNotification {
							let content = UNMutableNotificationContent()
							content.title = title
							content.body = socketNotification.info
							content.sound = .default
							content.userInfo = userInfo  //[

							let request = UNNotificationRequest(
								identifier: UUID().uuidString,
								content: content,
								trigger: nil
							)
							UNUserNotificationCenter.current()
								.add(request) { [weak self] error in
									if let error = error {
										self?.logger
											.log(
												"Error submitting local notification: \(error.localizedDescription, privacy: .public)"
											)
										return
									}

									self?.logger.log("Local notification posted successfully")
								}
						}
					}
					else {
						self.logger.error("Error during websocket receive: Looks like we couldn't parse the data?)")
					}
				}
				self.receiveNextMessage()
			}
		}
	}

	func stop(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
		logger.log("stop() called")
		socket?.cancel(with: .goingAway, reason: nil)
		socket = nil
		session?.finishTasksAndInvalidate()
		startState = false
		socketPingTimer?.invalidate()
		socketPingTimer = nil
		completionHandler()
	}

	func handleTimerEvent() {
		if let pingTime = lastPing, Date().timeIntervalSince(pingTime) < 1.0 {
			logger.warning("HandleTimerEvent() called with very low delay from last call.")
			return
		}
		else if startState == false {
			logger.warning("HandleTimerEvent() called while in stop state.")
			return
		}
		logger.log(
			"HandleTimerEvent() called for instance \(String(format: "%p", self), privacy: .public) lastPing: \(self.lastPing?.debugDescription ?? "<nil>", privacy: .public)"
		)

		lastPing = Date()
		if socket == nil, startState == true {
			openWebSocket()
		}
		socket?
			.sendPing { [weak self] error in
				if let err = error {
					self?.logger.error("Error during ping to server: \(err.localizedDescription, privacy: .public)")
					self?.socket?.cancel(with: .goingAway, reason: nil)
					self?.socket = nil
					self?.start()
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
		if let provider = pushProvider {
			provider.reportIncomingCall(userInfo: dict)
		}
		else {
			// This optional block exists so our in-app socket can deliver an incoming phone call without linking anything new into the extension.
			incomingPhonecallHandler?(dict)
		}
	}
}

// Delegate methods for the session itself
extension WebsocketNotifier: URLSessionDelegate {
	func urlSession(_ session: URLSession, didBecomeInvalidWithError error: Error?) {
		logger.log("Session went invalid because: \(error)")
		self.session = nil
	}
}

// Delegate methods for the session's Tasks -- common to all task types
extension WebsocketNotifier: URLSessionTaskDelegate {
	public func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
		logger.log("Notifier Socket task received didCompleteWithError: \(error, privacy: .public)")
	}

	public func urlSession(
		_ session: URLSession,
		task: URLSessionTask,
		willPerformHTTPRedirection response: HTTPURLResponse,
		newRequest request: URLRequest,
		completionHandler: @escaping (URLRequest?) -> Void
	) {
		logger.log("Notifier Socket task received willPerformHTTPRedirection")
		completionHandler(request)
	}

	public func urlSession(
		_ session: URLSession,
		task: URLSessionTask,
		didReceive challenge: URLAuthenticationChallenge,
		completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
	) {
		logger.log(
			"Notifier Socket task received URLAuthenticationChallenge of type \(challenge.protectionSpace.authenticationMethod)."
		)
		completionHandler(.performDefaultHandling, nil)
	}
}

// Delegate methods for WebSocket tasks
extension WebsocketNotifier: URLSessionWebSocketDelegate {
	func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol: String?) {
		logger.log("Notifier Socket opened with protocol: \(didOpenWithProtocol ?? "<unknown>", privacy: .public)")

	}

	func urlSession(
		_ session: URLSession,
		webSocketTask: URLSessionWebSocketTask,
		didCloseWith: URLSessionWebSocketTask.CloseCode,
		reason: Data?
	) {
		logger.log("Socket closed with code: \(didCloseWith.rawValue)")
		socket?.cancel(with: .goingAway, reason: nil)
		socket = nil
	}
}
