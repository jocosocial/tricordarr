//
//  NotificationAvatar.swift
//  TricordarrKit
//
//  Sender avatars for chat (communication) notifications.
//

import CryptoKit
import Foundation
import Intents
import UIKit

/// Builds the sender avatar for a chat notification: the author's photo when it can be had, a letter
/// avatar otherwise.
///
/// FastImage's SDWebImage cache lives in the app's own sandbox, which the LocalPushExtension process
/// cannot read, so photos are kept in a small cache of their own in the shared app group container.
/// Swiftarr image filenames are unique per upload, so a cached file is never revalidated.
enum NotificationAvatar {
	private static let sizePoints: CGFloat = 64
	private static let fetchTimeout: TimeInterval = 4
	private static let maxCachedFiles = 200
	private static let brandColor = UIColor(red: 6 / 255, green: 57 / 255, blue: 83 / 255, alpha: 1)

	/// Shared accounts that read better as an abbreviation than as their first letter. Keep in step
	/// with `NotificationPlanner.kt` on Android.
	private static let aliasInitials = [
		"moderator": "M",
		"twitarrteam": "TT",
		"communitysupport": "CS",
		"tho": "THO",
	]

	/// Serializes avatar work and the post that follows it, so notifications go out in the order the
	/// socket delivered them without blocking the socket's receive loop.
	static let queue = DispatchQueue(label: "com.grantcohoe.tricordarr.NotificationAvatar")

	/// The letters drawn on a letter avatar for a user with no photo.
	static func initials(for username: String) -> String {
		if let alias = aliasInitials[username.lowercased()] {
			return alias
		}
		guard let first = username.first else { return "?" }
		return String(first).uppercased()
	}

	/// The avatar for `author`. Blocks for at most the fetch timeout, so call it only on `queue`.
	static func image(for author: UserHeader, serverUrl: String, urlPrefix: String) -> INImage {
		if let userImage = author.userImage, !userImage.isEmpty,
			let data = photoData(userImage: userImage, serverUrl: serverUrl, urlPrefix: urlPrefix)
		{
			return INImage(imageData: data)
		}
		return INImage(imageData: letterAvatar(initials(for: author.username)))
	}

	private static var cacheDirectory: URL? {
		FileManager.default
			.containerURL(forSecurityApplicationGroupIdentifier: WebsocketNotifier.appGroupSuiteName)?
			.appendingPathComponent("Library/Caches/NotificationAvatars", isDirectory: true)
	}

	/// The cache file for an image name. The name is hashed so a server value can never form a path.
	private static func cacheFile(for userImage: String, in directory: URL) -> URL {
		let digest = SHA256.hash(data: Data(userImage.utf8)).map { String(format: "%02x", $0) }.joined()
		return directory.appendingPathComponent(digest)
	}

	/// Cached photo bytes, or one bounded fetch of the thumbnail the app's AvatarImage shows. Nil on failure.
	private static func photoData(userImage: String, serverUrl: String, urlPrefix: String) -> Data? {
		let directory = cacheDirectory
		if let directory = directory, let cached = try? Data(contentsOf: cacheFile(for: userImage, in: directory)) {
			return cached
		}
		let encoded = userImage.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? userImage
		let base = serverUrl.hasSuffix("/") ? String(serverUrl.dropLast()) : serverUrl
		guard let url = URL(string: "\(base)\(urlPrefix)/image/thumb/\(encoded)") else { return nil }

		var request = URLRequest(url: url, timeoutInterval: fetchTimeout)
		request.cachePolicy = .reloadIgnoringLocalCacheData
		let semaphore = DispatchSemaphore(value: 0)
		var fetched: Data?
		URLSession.shared.dataTask(with: request) { data, response, error in
			defer { semaphore.signal() }
			if let error = error {
				Logging.logger.log("[NotificationAvatar.swift] fetch failed: \(error.localizedDescription, privacy: .public)")
				return
			}
			guard (response as? HTTPURLResponse)?.statusCode == 200, let data = data, UIImage(data: data) != nil else {
				return
			}
			fetched = data
		}.resume()
		_ = semaphore.wait(timeout: .now() + fetchTimeout + 1)

		if let data = fetched, let directory = directory {
			store(data, file: cacheFile(for: userImage, in: directory), directory: directory)
		}
		return fetched
	}

	/// Writes a photo and drops the oldest files beyond `maxCachedFiles`. Failures only cost a refetch.
	private static func store(_ data: Data, file: URL, directory: URL) {
		let manager = FileManager.default
		do {
			try manager.createDirectory(at: directory, withIntermediateDirectories: true)
			try data.write(to: file, options: .atomic)
			let files = try manager.contentsOfDirectory(
				at: directory,
				includingPropertiesForKeys: [.contentModificationDateKey]
			)
			guard files.count > maxCachedFiles else { return }
			let byAge = files.sorted {
				let lhs = (try? $0.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? .distantPast
				let rhs = (try? $1.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? .distantPast
				return lhs < rhs
			}
			byAge.prefix(files.count - maxCachedFiles).forEach { try? manager.removeItem(at: $0) }
		} catch {
			Logging.logger.log("[NotificationAvatar.swift] cache write failed: \(error.localizedDescription, privacy: .public)")
		}
	}

	/// PNG of a brand-blue circle with `initials` in white, sized down for two- and three-letter aliases.
	private static func letterAvatar(_ initials: String) -> Data {
		let size = CGSize(width: sizePoints, height: sizePoints)
		let renderer = UIGraphicsImageRenderer(size: size)
		return renderer.pngData { _ in
			brandColor.setFill()
			UIBezierPath(ovalIn: CGRect(origin: .zero, size: size)).fill()
			let scale: CGFloat = initials.count == 1 ? 0.5 : initials.count == 2 ? 0.4 : 0.3
			let attributes: [NSAttributedString.Key: Any] = [
				.font: UIFont.boldSystemFont(ofSize: sizePoints * scale),
				.foregroundColor: UIColor.white,
			]
			let text = NSAttributedString(string: initials, attributes: attributes)
			let textSize = text.size()
			text.draw(at: CGPoint(x: (size.width - textSize.width) / 2, y: (size.height - textSize.height) / 2))
		}
	}
}
