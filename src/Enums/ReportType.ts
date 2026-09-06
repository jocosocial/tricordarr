/**
 * The type of entity being reported. Matches Swiftarr's `ReportType`.
 * Distinct from `ReportContentType`, which is the URL path used when filing a report.
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Enumerations/ReportType.swift
 */
export enum ReportType {
  forum = 'forum',
  forumPost = 'forumPost',
  twarrt = 'twarrt',
  userProfile = 'userProfile',
  fez = 'fez',
  fezPost = 'fezPost',
  mkSong = 'mkSong',
  mkSongSnippet = 'mkSongSnippet',
  streamPhoto = 'streamPhoto',
  personalEvent = 'personalEvent',
  quartermasterItem = 'quartermasterItem',
}

export namespace ReportType {
  /**
   * Short label for lists such as "Open Reports" and the moderator log.
   */
  export const getLabel = (type?: ReportType): string => {
    switch (type) {
      case ReportType.forum:
        return 'Forum Thread';
      case ReportType.forumPost:
        return 'Forum Post';
      case ReportType.twarrt:
        return 'twarrt';
      case ReportType.userProfile:
        return 'User Profile';
      case ReportType.fez:
        return 'LFG/Private Event';
      case ReportType.fezPost:
        return 'Chat Message';
      case ReportType.mkSong:
        return 'Micro Karaoke Song';
      case ReportType.mkSongSnippet:
        return 'Micro Karaoke Snippet';
      case ReportType.streamPhoto:
        return 'Photostream Photo';
      case ReportType.personalEvent:
        return 'Personal Event';
      case ReportType.quartermasterItem:
        return 'Quartermaster Item';
      default:
        return type ?? 'content';
    }
  };
}
