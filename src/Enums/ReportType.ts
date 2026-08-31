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
        return 'forum';
      case ReportType.forumPost:
        return 'forum post';
      case ReportType.twarrt:
        return 'twarrt';
      case ReportType.userProfile:
        return 'profile';
      case ReportType.fez:
        return 'LFG';
      case ReportType.fezPost:
        return 'LFG/Seamail post';
      case ReportType.mkSong:
        return 'Micro Karaoke song';
      case ReportType.mkSongSnippet:
        return 'Micro Karaoke snippet';
      case ReportType.streamPhoto:
        return 'photostream photo';
      case ReportType.personalEvent:
        return 'personal event';
      case ReportType.quartermasterItem:
        return 'quartermaster item';
      default:
        return type ?? 'content';
    }
  };
}
