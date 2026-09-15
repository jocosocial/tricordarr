import {appUrl, extractPathFromWebUrl, joinUrl} from '#src/Libraries/UrlParser';

/**
 * The type of content to share. The enum values are the URL paths.
 * Except for siteUI which is a direct URL.
 */
export enum ShareContentType {
  forum = 'forum',
  forumPost = 'forum/containingpost',
  lfg = 'lfg',
  seamail = 'seamail',
  user = 'user',
  event = 'events',
  privateEvent = 'privateevent',
  performer = 'performer',
  hunt = 'hunt',
  puzzle = 'puzzle',
  siteUI = 'siteui',
  forumPostModerate = 'moderate/forumpost',
  forumModerate = 'moderate/forum',
  fezModerate = 'moderate/lfg',
  fezPostModerate = 'moderate/fezpost',
  profileModerate = 'moderate/userprofile',
  userModerate = 'moderate/user',
  photostreamModerate = 'moderate/photostream',
  privateEventModerate = 'moderate/personalevent',
  microKaraokeSongModerate = 'moderate/microkaraoke/song',
}

/**
 * User-facing name for each shareable content type. Used in the share sheet title.
 */
export const shareContentTypeLabels: Record<ShareContentType, string> = {
  [ShareContentType.forum]: 'Forum',
  [ShareContentType.forumPost]: 'Forum Post',
  [ShareContentType.lfg]: 'LFG',
  [ShareContentType.seamail]: 'Seamail',
  [ShareContentType.user]: 'User Profile',
  [ShareContentType.event]: 'Event',
  [ShareContentType.privateEvent]: 'Private Event',
  [ShareContentType.performer]: 'Performer',
  [ShareContentType.hunt]: 'Puzzle Hunt',
  [ShareContentType.puzzle]: 'Puzzle',
  [ShareContentType.siteUI]: 'Link',
  [ShareContentType.forumPostModerate]: 'Moderator View',
  [ShareContentType.forumModerate]: 'Moderator View',
  [ShareContentType.fezModerate]: 'Moderator View',
  [ShareContentType.fezPostModerate]: 'Moderator View',
  [ShareContentType.profileModerate]: 'Moderator View',
  [ShareContentType.userModerate]: 'Moderator View',
  [ShareContentType.photostreamModerate]: 'Moderator View',
  [ShareContentType.privateEventModerate]: 'Moderator View',
  [ShareContentType.microKaraokeSongModerate]: 'Moderator View',
};

/**
 * Share-sheet title for a content type, e.g. "Share Puzzle Hunt".
 * Falls back to "Share" when the type is unknown.
 */
export const getShareSheetTitle = (contentType?: ShareContentType): string => {
  if (!contentType) {
    return 'Share';
  }
  return `Share ${shareContentTypeLabels[contentType]}`;
};

/**
 * Whether a share link is a public HTTPS URL or a tricordarr:// deep link.
 */
export enum ShareLinkMode {
  web = 'web',
  app = 'app',
}

interface GetShareLinkProps {
  mode: ShareLinkMode;
  serverUrl: string;
  contentType: ShareContentType;
  contentID: string | number;
}

/**
 * Builds a shareable link for a content item.
 * Web mode returns a public Twitarr URL (`siteUI` IDs are already full URLs).
 * App mode returns a tricordarr:// deep link.
 */
export const getShareLink = ({mode, serverUrl, contentType, contentID}: GetShareLinkProps): string => {
  const relativePath =
    contentType === ShareContentType.siteUI
      ? extractPathFromWebUrl(String(contentID))
      : joinUrl(contentType, contentID);

  if (mode === ShareLinkMode.app) {
    return appUrl(relativePath);
  }

  if (contentType === ShareContentType.siteUI) {
    return String(contentID);
  }
  return joinUrl(serverUrl, relativePath);
};

/**
 * Combines a post's text with its share link into one plaintext message.
 * Falls back to the bare link when there is no text to share.
 */
export const buildShareMessage = (text: string | undefined, link: string): string => {
  if (!text) {
    return link;
  }
  return `${text}\n\n${link}`;
};
