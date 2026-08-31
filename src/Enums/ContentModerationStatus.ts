/**
 * Moderation status of a piece of reportable content.
 * Matches Swiftarr's `ContentModerationStatus`.
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Enumerations/ReportType.swift
 */
export enum ContentModerationStatus {
  /// The initial state for all content.
  normal = 'normal',
  /// Hidden from non-mods after enough user reports. Mods can still see the original.
  autoQuarantined = 'autoQuarantined',
  /// Hidden from non-mods by a moderator. Useful as an interim while discussing.
  quarantined = 'quarantined',
  /// Deemed OK by mods and immune to auto-quarantine. Author edits reset this to normal.
  modReviewed = 'modReviewed',
  /// Visible, but not modifiable by non-mods. Immune to auto-quarantine.
  locked = 'locked',
}

export namespace ContentModerationStatus {
  /**
   * Path parameter used by `POST /api/v3/mod/.../setstate/:state`.
   * Auto-quarantined cannot be set by mods; `modReviewed` is sent as `reviewed`.
   */
  export const getApiParameter = (status: ContentModerationStatus): string => {
    switch (status) {
      case ContentModerationStatus.modReviewed:
        return 'reviewed';
      case ContentModerationStatus.normal:
        return 'normal';
      case ContentModerationStatus.quarantined:
        return 'quarantined';
      case ContentModerationStatus.locked:
        return 'locked';
      case ContentModerationStatus.autoQuarantined:
        return 'quarantined';
    }
  };

  /**
   * States a moderator may apply. Auto-quarantined is server-only.
   */
  export const settableStates: ContentModerationStatus[] = [
    ContentModerationStatus.normal,
    ContentModerationStatus.quarantined,
    ContentModerationStatus.modReviewed,
    ContentModerationStatus.locked,
  ];

  /**
   * User-facing label for a moderation status.
   */
  export const getLabel = (status?: ContentModerationStatus): string => {
    switch (status) {
      case ContentModerationStatus.normal:
        return 'Normal';
      case ContentModerationStatus.autoQuarantined:
        return 'Auto-Quarantined';
      case ContentModerationStatus.quarantined:
        return 'Quarantined';
      case ContentModerationStatus.modReviewed:
        return 'Moderator Reviewed';
      case ContentModerationStatus.locked:
        return 'Locked';
      default:
        return status ?? 'Unknown';
    }
  };

  /**
   * Menu label including Swiftarr's parenthetical on reviewed.
   */
  export const getActionLabel = (status: ContentModerationStatus): string => {
    if (status === ContentModerationStatus.modReviewed) {
      return 'Moderator Reviewed (looks good as is)';
    }
    return getLabel(status);
  };

  /**
   * FALSE when the content is hidden from non-moderator users.
   */
  export const showsContent = (status: ContentModerationStatus): boolean => {
    return status !== ContentModerationStatus.autoQuarantined && status !== ContentModerationStatus.quarantined;
  };
}
