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
  /// A limited user, usually teens.
  /// TODO: this is not implemented server-side yet.
  limited = 'limited',
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
      case UserAccessLevel.limited:
        return 4;
      case UserAccessLevel.verified:
        return 5;
      case UserAccessLevel.client:
        return 6;
      case UserAccessLevel.moderator:
        return 7;
      case UserAccessLevel.twitarrteam:
        return 8;
      case UserAccessLevel.tho:
        return 9;
      case UserAccessLevel.admin:
        return 10;
    }
  }

  /**
   * Returns consumer-friendly case names.
   * Equivalent to Swift's `.visibleName()` property.
   */
  export const getLabel = (accessLevel?: UserAccessLevel): string => {
    switch (accessLevel) {
      case UserAccessLevel.unverified:
        return 'Unverified';
      case UserAccessLevel.banned:
        return 'Banned';
      case UserAccessLevel.quarantined:
        return 'Quarantined';
      case UserAccessLevel.verified:
        return 'Verified';
      case UserAccessLevel.client:
        return 'Client';
      case UserAccessLevel.moderator:
        return 'Moderator';
      case UserAccessLevel.twitarrteam:
        return 'TwitarrTeam';
      case UserAccessLevel.tho:
        return 'THO';
      case UserAccessLevel.admin:
        return 'Administrator';
      case UserAccessLevel.limited:
        return 'Limited';
      default:
        return accessLevel ?? 'Unknown';
    }
  };

  /**
   * Returns a user-facing description of what the access level means.
   */
  export const getDescription = (accessLevel?: UserAccessLevel): string => {
    switch (accessLevel) {
      case UserAccessLevel.unverified:
        return 'Limited access';
      case UserAccessLevel.banned:
        return 'Forbidden';
      case UserAccessLevel.quarantined:
        return 'Under Moderator review';
      case UserAccessLevel.limited:
        return 'Limited features available';
      case UserAccessLevel.verified:
        return 'All features available';
      case UserAccessLevel.client:
        return 'API Client';
      case UserAccessLevel.moderator:
        return 'Thank you for your service';
      case UserAccessLevel.twitarrteam:
        return "'sup nerd";
      case UserAccessLevel.tho:
        return '"Schmincoln Center Stage"';
      case UserAccessLevel.admin:
        return 'With great power comes great responsibility';
      default:
        return 'Unknown access level.';
    }
  };

  /**
   * Test whether a source UserAccessLevel has access to a target UserAccessLevel.
   */
  export function hasAccess(source: UserAccessLevel, target: UserAccessLevel): boolean {
    return orderFromEnum(source) >= orderFromEnum(target);
  }

  /**
   * Convenience function to determine whether a particular UserAccessLevel is considered "privileged".
   * @deprecated this should go away.
   */
  export function isPrivileged(source: UserAccessLevel): boolean {
    return orderFromEnum(source) > orderFromEnum(UserAccessLevel.verified);
  }
}

/**
 * Mapping of all privileged user accounts. The value in each key
 * should match the username (case sensitive) of the pre-programmed
 * privileged user in the server.
 */
export const PrivilegedUserAccounts = {
  admin: 'admin',
  TwitarrTeam: 'TwitarrTeam',
  THO: 'THO',
  moderator: 'moderator',
} as const;
