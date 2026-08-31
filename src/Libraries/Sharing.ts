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
