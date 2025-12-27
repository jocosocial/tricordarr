/**
 * UserRole is a simple role-based access control mechanism mostly used for elevating 'verified' users to have specific extra access.
 * UserRole is therefore an access model that works in addition to Twitarr's priority access model (see `UserAccessLevel`). With UserLevels,
 * each increasing access level is a superset of access provided by the previous level. Roles allow multiple users to each extend the `verified` permissions
 * without one of the extensions always being a superset of the other.
 *
 * This implementation is not a full RBAC. Instead:
 * 	- Each user may have multiple roles
 * 	- A db object or API call that requires a role to use must test that the requesting user has the proper role.
 * 	- Roles implicitly define permissions; there is no facility to add/remove permissions from roles.
 * 	- There is no role hierarchy. An operation X that allows X_User and X_Manager to access it must test for both roles explicitly.
 * 	- Ideally, a DB object that requires a role to access should only require one role be stored for it.
 * 	- In general, a nil value for a DB object's `requiredRole` should mean no special role is required to access it.
 * 	- Moderators and above should usually have access to role-protected content; without us having to add a bunch of roles to each moderator user.
 *
 * From https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Enumerations/UserRoleType.swift
 */
export enum UserRoleType {
  /// KaraokeManagers have the ability to log song performances in the Karaoke Bar.
  karaokemanager = 'karaokemanager',
  /// Shutternaut Managers can add and remove members from the Shutternauts group. Note: Because of the "no hierarchy" rule, managers are NOT automatically Shutternauts.
  shutternautmanager = 'shutternautmanager',
  /// Shutternauts can view, post, and create threads in the Shutternauts forum category.
  shutternaut = 'shutternaut',
  /// Micro Karaoke Ambassadors can upload multiple song clips for the same song, without the 4-hour delay. Ideally, they will use this to get others to participate using their phone;
  /// having a single user hit the 'participate' button 30 times in quick succession and make a song where all the clips are them is not the goal.
  karaokeambassador = 'karaokeambassador',
  /// Users that may create/edit their Performer profile outside of Pre-Registration, that is, on-board.
  performerselfeditor = 'performerselfeditor',
}

export namespace UserRoleType {
  /**
   * Returns consumer-friendly case names.
   * Equivalent to Swift's `.label` property.
   */
  export const getLabel = (roleType: UserRoleType): string => {
    switch (roleType) {
      case UserRoleType.karaokemanager:
        return 'Karaoke Manager';
      case UserRoleType.shutternautmanager:
        return 'Shutternaut Manager';
      case UserRoleType.shutternaut:
        return 'Shutternaut';
      case UserRoleType.karaokeambassador:
        return 'Micro Karaoke Ambassador';
      case UserRoleType.performerselfeditor:
        return '"Allowed to create/edit their Shadow Event Performer"';
    }
  };

  /**
   * This gives us a bit more control than direct enum access. Since the strings for UserRoleType are part of the API
   * (specifically, they're URL query values), they should be somewhat abstracted from internal representation.
   * This fn provides lazy abstraction, making it easy for API strings to get re-mapped to enum values, in the future.
   * URL Parameters that take an UserRoleType string should use this function to make a `UserRoleType` from the input.
   * Equivalent to Swift's `init(fromAPIString:)`.
   * @throws Error if the string is not a valid UserRoleType
   */
  export const fromAPIString = (str: string): UserRoleType => {
    const lowercased = str.toLowerCase();
    const roleType = Object.values(UserRoleType).find(value => value === lowercased) as UserRoleType | undefined;

    if (!roleType) {
      throw new Error(`Unknown UserRoleType parameter value: ${str}`);
    }

    return roleType;
  };

  /**
   * A failable function for turning an optional string into a UserRoleType, if the string equals one of the enum cases.
   * Equivalent to Swift's `init?(fromString:)`.
   * @returns UserRoleType if the string is valid, undefined otherwise
   */
  export const fromString = (str: string | null | undefined): UserRoleType | undefined => {
    if (!str) {
      return undefined;
    }

    const lowercased = str.toLowerCase();
    return Object.values(UserRoleType).find(value => value === lowercased) as UserRoleType | undefined;
  };
}
