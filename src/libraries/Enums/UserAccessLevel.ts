/// All API endpoints are protected by a minimum user access level.
/// This `enum` structure MUST match the values in `CreateCustomEnums` in SchemaCreation.swift
/// as this enum is part of the database schema. This enum is also sent out in several Data Transfer Object types.
/// Think very carefully about modifying these values.
///
/// From https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Enumerations/UserAccessLevel.swift#L8-L28
export enum UserAccessLevel {
  /// A user account that has not yet been activated. [read-only, limited]
  unverified = 'unverified',
  /// A user account that has been banned. [cannot log in]
  banned = 'banned',
  /// A `.verified` user account that has triggered Moderator review. [read-only]
  quarantined = 'quarantined',
  /// A user account that has been activated for full read-write access.
  verified = 'verified',
  /// A special class of account for registered API clients. [see `ClientController`]
  client = 'client',
  /// An account whose owner is part of the Moderator Team.
  moderator = 'moderator',
  /// Twitarr devs should have their accounts elevated to this level to help handle seamail to 'twitarrteam'
  twitarrteam = 'twitarrteam',
  /// An account officially associated with Management, has access to all `.moderator`
  /// and a subset of `.admin` functions (the non-destructive ones). Can ban users.
  tho = 'tho',
  /// An Administrator account, unrestricted access.
  admin = 'admin',
}

/**
 * As far as I know, TypeScript doesn't have an equivalent to the Swift
 * Comparable protocol, nor does it let you add functions to enums.
 */
export namespace UserAccessLevel {
  function orderFromEnum(val: UserAccessLevel) {
    switch (val) {
      case UserAccessLevel.unverified:
        return 1;
      case UserAccessLevel.banned:
        return 2;
      case UserAccessLevel.quarantined:
        return 3;
      case UserAccessLevel.verified:
        return 4;
      case UserAccessLevel.client:
        return 5;
      case UserAccessLevel.moderator:
        return 6;
      case UserAccessLevel.twitarrteam:
        return 7;
      case UserAccessLevel.tho:
        return 8;
      case UserAccessLevel.admin:
        return 9;
    }
  }
  export function hasAccess(source: UserAccessLevel, target: UserAccessLevel): boolean {
    return orderFromEnum(source) >= orderFromEnum(target);
  }
  export function isPrivileged(source: UserAccessLevel): boolean {
    return orderFromEnum(source) > orderFromEnum(UserAccessLevel.verified);
  }
}
