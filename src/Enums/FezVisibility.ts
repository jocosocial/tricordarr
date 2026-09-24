import {FezType} from '#src/Enums/FezType';

/**
 * Lifted from https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Enumerations/FezVisibility.swift
 * These have to stay lower-case in the values since those are what get POST'd to the server.
 */
export enum FezVisibility {
  /// The default for Seamails (open/closed) and personalEvent. A non-member, non-moderator GET on the fez 403s.
  private = 'private',
  /// The default for all LFG types. Non-members can view the fez (but not `members`) and can search for it.
  public = 'public',
  /// Only valid on privateEvent. Non-members can view the fez (but not `members`) via a direct link,
  /// and can self-join, but the event is never listed/searchable.
  unlisted = 'unlisted',
}

export namespace FezVisibility {
  /**
   * Human-readable label for a visibility value. Returns undefined for an absent value so
   * callers can omit the field entirely rather than render "Unknown".
   */
  export const getLabel = (visibility?: FezVisibility): string | undefined => {
    switch (visibility) {
      case FezVisibility.private:
        return 'Private';
      case FezVisibility.public:
        return 'Public';
      case FezVisibility.unlisted:
        return 'Unlisted';
      default:
        return undefined;
    }
  };

  /**
   * The visibility a fez of the given type gets unless explicitly overridden.
   * Mirrors FezVisibility.defaultVisibility(for:) upstream.
   */
  export const getDefault = (fezType: FezType): FezVisibility =>
    FezType.isLFGType(fezType) ? FezVisibility.public : FezVisibility.private;

  /**
   * TRUE when visibility is user-meaningful for this Fez type. Every type other than
   * privateEvent has a fixed visibility that the server will not let you change, so we
   * only surface it for private/personal events.
   */
  export const isMeaningful = (fezType: FezType): boolean => FezType.isPrivateEventType(fezType);
}
