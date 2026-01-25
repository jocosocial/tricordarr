//
//  UserPreferences.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/4/25.
//

import Foundation

/// User preferences structs. These are currently only in Tricordarr but some day may make their way into Swiftarr
/// if we ever elect to build global user preferences.

/// Forum sort enum matching TypeScript ForumSort
enum ForumSort: String, Codable {
  case event = "event"
  case update = "update"
  case create = "create"
  case title = "title"
}

/// Forum sort direction enum matching TypeScript ForumSortDirection
enum ForumSortDirection: String, Codable {
  case ascending = "ascending"
  case descending = "descending"
}

/// FezListEndpoints enum matching TypeScript FezListEndpoints type
/// Used for the default LFG screen configuration
/// Seeing this here.... I really hyper-fixated on this one feature that I'd bet money no-one used.
/// This lets you configure the default screen of the LFG tab. Wow......
enum FezListEndpoints: String, Codable {
  case open = "open"
  case joined = "joined"
  case owner = "owner"
  case former = "former"
}
