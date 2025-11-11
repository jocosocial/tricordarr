/**
 * The type of content to share. The enum values are the URL paths.
 * Except for siteUI which is a direct URL.
 */
export enum ShareContentType {
  forum = 'forum',
  forumPost = 'forum/containingpost',
  lfg = 'lfg',
  user = 'user',
  event = 'events',
  siteUI = 'siteui',
}
