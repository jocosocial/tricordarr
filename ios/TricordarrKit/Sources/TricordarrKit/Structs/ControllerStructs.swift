//
//  ControllerStructs.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/2/25.
//
//  The structs in this file are sourced from
//  https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Controllers/Structs/ControllerStructs.swift
//  They may be slightly modified to be extracted from Vapor.

import Foundation

/// Used to obtain a user's current header information (name and image) for attributed content.
public struct UserHeader: Codable {
	/// The user's ID.
	var userID: UUID
	/// The user's username.
	var username: String
	/// The user's displayName.
	var displayName: String?
	/// The user's avatar image.
	var userImage: String?
	/// An optional preferred pronoun or form of address.
	var preferredPronoun: String?
}
