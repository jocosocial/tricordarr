/**
 * Type of action a moderator took. Matches Swiftarr's `ModeratorActionType`.
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Enumerations/ModeratorActionType.swift
 */
export enum ModeratorActionType {
  post = 'post',
  edit = 'edit',
  delete = 'delete',
  move = 'move',
  quarantine = 'quarantine',
  markReviewed = 'markReviewed',
  lock = 'lock',
  unlock = 'unlock',
  pin = 'pin',
  unpin = 'unpin',
  accessLevelUnverified = 'accessLevelUnverified',
  accessLevelBanned = 'accessLevelBanned',
  accessLevelQuarantined = 'accessLevelQuarantined',
  accessLevelVerified = 'accessLevelVerified',
  accessLevelModerator = 'accessLevelModerator',
  accessLevelTwitarrTeam = 'accessLevelTwitarrTeam',
  accessLevelTHO = 'accessLevelTHO',
  tempQuarantine = 'tempQuarantine',
  tempQuarantineCleared = 'tempQuarantineCleared',
}

export namespace ModeratorActionType {
  /**
   * User-facing label for a logged moderator action.
   */
  export const getLabel = (action?: ModeratorActionType): string => {
    switch (action) {
      case ModeratorActionType.post:
        return 'Post';
      case ModeratorActionType.edit:
        return 'Edit';
      case ModeratorActionType.delete:
        return 'Delete';
      case ModeratorActionType.move:
        return 'Move';
      case ModeratorActionType.quarantine:
        return 'Quarantine';
      case ModeratorActionType.markReviewed:
        return 'Mark Reviewed';
      case ModeratorActionType.lock:
        return 'Lock';
      case ModeratorActionType.unlock:
        return 'Unlock';
      case ModeratorActionType.pin:
        return 'Pin';
      case ModeratorActionType.unpin:
        return 'Unpin';
      case ModeratorActionType.accessLevelUnverified:
        return 'Set Unverified';
      case ModeratorActionType.accessLevelBanned:
        return 'Ban';
      case ModeratorActionType.accessLevelQuarantined:
        return 'Set Quarantined';
      case ModeratorActionType.accessLevelVerified:
        return 'Set Verified';
      case ModeratorActionType.accessLevelModerator:
        return 'Set Moderator';
      case ModeratorActionType.accessLevelTwitarrTeam:
        return 'Set TwitarrTeam';
      case ModeratorActionType.accessLevelTHO:
        return 'Set THO';
      case ModeratorActionType.tempQuarantine:
        return 'Temp Quarantine';
      case ModeratorActionType.tempQuarantineCleared:
        return 'Clear Temp Quarantine';
      default:
        return action ?? 'Unknown';
    }
  };
}
