//
//  SocketStructs.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/2/25.
//
//  The structs in this file are sourced from
//  https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Controllers/Structs/SocketStructs.swift
//  They may be slightly modified to be extracted from Vapor.

import Foundation

// `enum NotificationTypeData`, with its `rawValue` and `init?(rawValue:)`, is generated into
// Generated/NotificationEvents.generated.swift from specs/NotificationEvents.json.

/// Informs Notification WebSocket clients of a new notification.
///
/// Each notification is delivered as a JSON string, containing a type of announcement and a string appropriate for displaying to the user.
/// The string will be of the form, "User @authorName wrote a forum post that mentioned you."
struct SocketNotificationData: Codable {
	/// The type of event that happened. See `SocketNotificationData.NotificationTypeData` for values.
	var type: NotificationTypeData
	/// A string describing what happened, suitable for adding to a notification alert.
	var info: String
	/// An ID of an Announcement, Fez, Twarrt, ForumPost, or Event.
	var contentID: String
	/// An ID of a related parent object, when one exists. For forum mention and alertword post notifications this is the Forum ID.
	var secondaryContentID: String?
	/// For .incomingPhoneCall notifications, the caller.
	var caller: UserHeader?
	/// For .incomingPhoneCall notification,s the caller's IP addresses. May be nil, in which case the receiver opens a server socket instead.
	var callerAddress: PhoneSocketServerAddress?
}

/// Notifies the recipient of a phone call the IP addr of the caller, so the recipient can open a direct-connect WebSocket
/// to the caller (who must have started a WebSocket Server to receive the incoming connection).
struct PhoneSocketServerAddress: Codable {
	var ipV4Addr: String?
	var ipV6Addr: String?
}
