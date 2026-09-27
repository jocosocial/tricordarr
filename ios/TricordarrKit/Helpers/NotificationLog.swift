//
//  NotificationLog.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/10/25.
//

import Foundation

/// Persists a JSONL (one JSON object per line) history of every event received on the
/// notification websocket, regardless of whether it produced a push notification. This is
/// the iOS half of the notification log feature: the background socket lives entirely in
/// this process (or the `LocalPushExtension` process) and never reaches JS, so this file in
/// the shared App Group container is the only place those events are ever recorded. The
/// Android equivalent (src/Libraries/NotificationLog/index.ts) writes JSON with the same
/// shape directly from JS, since the notification socket there is always a JS
/// ReconnectingWebSocket.
///
/// `NativeTricordarrModule` reads and clears this file for the JS-side NotificationLogScreen.
@objc public final class NotificationLog: NSObject {

	private static let fileName = "notification-log.jsonl"
	private static let retentionDays = 7
	private static let maxEntries = 1000
	private static let queue = DispatchQueue(label: "com.grantcohoe.tricordarr.notificationlog")
	private static let logger = Logging.getLogger("NotificationLog")

	private static let iso8601Formatter: ISO8601DateFormatter = {
		let formatter = ISO8601DateFormatter()
		formatter.formatOptions.insert(.withFractionalSeconds)
		return formatter
	}()

	// Mirrors the JSONL shape written by src/Libraries/NotificationLog/index.ts.
	private struct StoredEntry: Codable {
		let timestamp: String
		let type: String
		let contentID: String
		let info: String
		let source: String
		let raw: String
	}

	private static var logFileURL: URL? {
		guard
			let containerURL = FileManager.default.containerURL(
				forSecurityApplicationGroupIdentifier: WebsocketNotifier.appGroupSuiteName
			)
		else {
			logger.error("[NotificationLog.swift] Failed to resolve App Group container URL")
			return nil
		}
		return containerURL.appendingPathComponent(fileName)
	}

	/// Records a single notification-socket event. Called from `WebsocketNotifier` right
	/// after a successful decode, before any mute/category suppression, so the log reflects
	/// everything the socket actually delivered. Never throws; failures are logged and
	/// swallowed so a logging problem can't take down the socket receive loop.
	static func append(_ notification: SocketNotificationData, raw: Data) {
		queue.async {
			guard let url = logFileURL else { return }
			let rawString = String(data: raw, encoding: .utf8) ?? ""
			let entry = StoredEntry(
				timestamp: iso8601Formatter.string(from: Date()),
				type: notification.type.rawValue,
				contentID: notification.contentID,
				info: notification.info,
				source: "ios-native",
				raw: rawString
			)
			guard let entryData = try? JSONEncoder().encode(entry),
				var line = String(data: entryData, encoding: .utf8)
			else {
				logger.error("[NotificationLog.swift] Failed to serialize entry")
				return
			}
			line += "\n"

			do {
				if !FileManager.default.fileExists(atPath: url.path) {
					FileManager.default.createFile(atPath: url.path, contents: nil)
				}
				let handle = try FileHandle(forWritingTo: url)
				defer { try? handle.close() }
				handle.seekToEndOfFile()
				if let data = line.data(using: .utf8) {
					handle.write(data)
				}
			}
			catch {
				logger.error(
					"[NotificationLog.swift] Failed to write entry: \(error.localizedDescription, privacy: .public)"
				)
			}

			pruneIfNeeded()
		}
	}

	/// Rewrites the file keeping only the newest `maxEntries` lines, if it has grown past
	/// that. Must be called on `queue`.
	private static func pruneIfNeeded() {
		guard let url = logFileURL, let text = try? String(contentsOf: url, encoding: .utf8) else { return }
		let lines = text.split(separator: "\n", omittingEmptySubsequences: true)
		guard lines.count > maxEntries else { return }
		let trimmed = lines.suffix(maxEntries)
		let newText = trimmed.joined(separator: "\n") + "\n"
		try? newText.write(to: url, atomically: true, encoding: .utf8)
	}

	/// Returns the raw JSONL contents of the log, filtered to entries within `retentionDays`.
	/// Called from the native module for the JS-side NotificationLogScreen.
	@objc public static func read() -> String {
		queue.sync {
			guard let url = logFileURL, let text = try? String(contentsOf: url, encoding: .utf8) else {
				return ""
			}
			let cutoff = Date().addingTimeInterval(-Double(retentionDays) * 24 * 60 * 60)
			let lines = text.split(separator: "\n", omittingEmptySubsequences: true)
			let kept = lines.filter { line in
				guard let data = line.data(using: .utf8),
					let entry = try? JSONDecoder().decode(StoredEntry.self, from: data),
					let date = iso8601Formatter.date(from: entry.timestamp)
				else {
					return false
				}
				return date >= cutoff
			}
			return kept.joined(separator: "\n")
		}
	}

	/// Deletes the log file. Called from the native module.
	@objc public static func clear() {
		queue.sync {
			guard let url = logFileURL else { return }
			try? FileManager.default.removeItem(at: url)
		}
	}
}
