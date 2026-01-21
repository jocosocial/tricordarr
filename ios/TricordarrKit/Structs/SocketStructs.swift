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

enum NotificationTypeData: Codable {
	// Notifies Everyone
	/// A server-wide announcement has just been added.
	case announcement

	// Added to Chat - only fires when someone else adds you to their chat
	// Note: I'm specifically not making notifications for "Removed From Chat" because: it can feel mean to receive that notification, and
	// there's nowhere for the notification to take the user.
	///  Only for 'open' seamails. The owner of the chata has added this user.
	case addedToSeamail
	/// The creator of the LFG has added this user.
	case addedToLFG
	/// The creator of the event has added this user.
	case addedToPrivateEvent
	/// A Private Event the user has joined has been canceled.
	case privateEventCanceled
	/// An LFG the user has joined has been canceled.
	case lfgCanceled

	// New Chat Messages
	/// A participant in a Chat the user is a member of has posted a new message.
	case fezUnreadMsg
	/// A participant in a Seamail thread the user is a member of has posted a new message.
	case seamailUnreadMsg
	/// An invitee to a Private Event has posted a new chat message in the event's chat.
	case privateEventUnreadMsg

	// Starting Soon
	/// An event the user is following is about to start.
	case followedEventStarting
	/// An LFG the user has joined is about to start.
	case joinedLFGStarting
	/// A Personal Event the user has created or was added to is about to start.
	case personalEventStarting

	// @mentions and Alertwords
	/// A user has posted a Twarrt that contains a word this user has set as an alertword.
	case alertwordTwarrt
	/// A user has posted a Forum Post that contains a word this user has set as an alertword.
	case alertwordPost
	/// A user has posted a Twarrt that @mentions this user.
	case twarrtMention
	/// A user has posted a Forum Post that @mentions this user.
	case forumMention

	// Phonecalls
	/// Someone is trying to call this user via KrakenTalk.'
	case incomingPhoneCall
	/// The callee answered the call, possibly on another device.
	case phoneCallAnswered
	/// Caller hung up while phone was rining, or other party ended the call in progress, or callee declined
	case phoneCallEnded

	// Micro Karaoke
	/// A Micro Karaoke song the user contributed to is ready for viewing. .
	case microKaraokeSongReady

	// Mod Stuff
	/// A new or edited forum post that now @mentions @moderator.
	case moderatorForumMention
	/// A new or edited forum post that now @mentions @twitarrteam.
	case twitarrTeamForumMention
}

extension NotificationTypeData {
	// Computed property to get the string representation (matches JavaScript enum values)
	var rawValue: String {
		switch self {
		case .announcement: return "announcement"
		case .addedToSeamail: return "addedToSeamail"
		case .addedToLFG: return "addedToLFG"
		case .addedToPrivateEvent: return "addedToPrivateEvent"
		case .privateEventCanceled: return "privateEventCanceled"
		case .lfgCanceled: return "lfgCanceled"
		case .fezUnreadMsg: return "fezUnreadMsg"
		case .seamailUnreadMsg: return "seamailUnreadMsg"
		case .privateEventUnreadMsg: return "privateEventUnreadMsg"
		case .followedEventStarting: return "followedEventStarting"
		case .joinedLFGStarting: return "joinedLFGStarting"
		case .personalEventStarting: return "personalEventStarting"
		case .alertwordTwarrt: return "alertwordTwarrt"
		case .alertwordPost: return "alertwordPost"
		case .twarrtMention: return "twarrtMention"
		case .forumMention: return "forumMention"
		case .incomingPhoneCall: return "incomingPhoneCall"
		case .phoneCallAnswered: return "phoneCallAnswered"
		case .phoneCallEnded: return "phoneCallEnded"
		case .microKaraokeSongReady: return "microKaraokeSongReady"
		case .moderatorForumMention: return "moderatorForumMention"
		case .twitarrTeamForumMention: return "twitarrTeamForumMention"
		}
	}

	// Initialize from raw string value
	init?(rawValue: String) {
		switch rawValue {
		case "announcement": self = .announcement
		case "addedToSeamail": self = .addedToSeamail
		case "addedToLFG": self = .addedToLFG
		case "addedToPrivateEvent": self = .addedToPrivateEvent
		case "privateEventCanceled": self = .privateEventCanceled
		case "lfgCanceled": self = .lfgCanceled
		case "fezUnreadMsg": self = .fezUnreadMsg
		case "seamailUnreadMsg": self = .seamailUnreadMsg
		case "privateEventUnreadMsg": self = .privateEventUnreadMsg
		case "followedEventStarting": self = .followedEventStarting
		case "joinedLFGStarting": self = .joinedLFGStarting
		case "personalEventStarting": self = .personalEventStarting
		case "alertwordTwarrt": self = .alertwordTwarrt
		case "alertwordPost": self = .alertwordPost
		case "twarrtMention": self = .twarrtMention
		case "forumMention": self = .forumMention
		case "incomingPhoneCall": self = .incomingPhoneCall
		case "phoneCallAnswered": self = .phoneCallAnswered
		case "phoneCallEnded": self = .phoneCallEnded
		case "microKaraokeSongReady": self = .microKaraokeSongReady
		case "moderatorForumMention": self = .moderatorForumMention
		case "twitarrTeamForumMention": self = .twitarrTeamForumMention
		default: return nil
		}
	}

	// // Custom Codable implementation to handle object format: {"seamailUnreadMsg": {}}
	// // This matches the TypeScript type: {[key: string]: {}}
	// init(from decoder: Decoder) throws {
	// 	let container = try decoder.singleValueContainer()
	// 	// The JSON format is an object like {"seamailUnreadMsg": {}}
	// 	// We decode it as [String: [String: String]] where the inner dictionary is empty
	// 	let dict = try container.decode([String: [String: String]].self)
	// 	// Extract the first (and only) key from the dictionary
	// 	guard let key = dict.keys.first else {
	// 		throw DecodingError.dataCorruptedError(
	// 			in: container,
	// 			debugDescription: "NotificationTypeData object is empty"
	// 		)
	// 	}
	// 	guard let value = NotificationTypeData(rawValue: key) else {
	// 		throw DecodingError.dataCorruptedError(
	// 			in: container,
	// 			debugDescription: "Invalid NotificationTypeData key: \(key)"
	// 		)
	// 	}
	// 	self = value
	// }

	// func encode(to encoder: Encoder) throws {
	// 	// Encode as object format: {"seamailUnreadMsg": {}}
	// 	var container = encoder.singleValueContainer()
	// 	// Create an empty dictionary as the value, matching the TypeScript format
	// 	try container.encode([self.rawValue: [String: String]()])
	// }
}

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
