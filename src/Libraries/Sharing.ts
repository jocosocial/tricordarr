import {appUrl, extractPathFromWebUrl, joinUrl} from '#src/Libraries/UrlParser';

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
  performer = 'performer',
  hunt = 'hunt',
  puzzle = 'puzzle',
  siteUI = 'siteui',
}

/**
 * User-facing name for each shareable content type. Used in the share sheet title.
 */
export const shareContentTypeLabels: Record<ShareContentType, string> = {
  [ShareContentType.forum]: 'Forum',
  [ShareContentType.forumPost]: 'Forum Post',
  [ShareContentType.lfg]: 'LFG',
  [ShareContentType.user]: 'User Profile',
  [ShareContentType.event]: 'Event',
  [ShareContentType.performer]: 'Performer',
  [ShareContentType.hunt]: 'Puzzle Hunt',
  [ShareContentType.puzzle]: 'Puzzle',
  [ShareContentType.siteUI]: 'Link',
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
