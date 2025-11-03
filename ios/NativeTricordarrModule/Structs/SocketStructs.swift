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

/// Informs Notification WebSocket clients of a new notification.
///
/// Each notification is delivered as a JSON string, containing a type of announcement and a string appropriate for displaying to the user.
/// The string will be of the form, "User @authorName wrote a forum post that mentioned you."
struct SocketNotificationData: Codable {
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
