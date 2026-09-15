import urlJoin from 'url-join';
import URLParse from 'url-parse';

/**
 * Scheme prefix registered with React Navigation for in-app deep links.
 * Used as `navigationLinking.prefixes` in Linking.ts.
 */
export const appLinkPrefix = 'tricordarr://';

/**
 * Join URL parts, normalizing leading and trailing slashes.
 * Coerces numbers so callers can pass values like Date.now().
 * Omits undefined and empty parts so optional segments do not become `"undefined"` or a trailing slash.
 */
export const joinUrl = (...parts: Array<string | number | undefined>): string =>
  urlJoin(...parts.filter((part): part is string | number => part !== undefined && part !== '').map(String));

/**
 * Build a tricordarr:// deep link from path segments.
 * Bakes in appLinkPrefix so callers do not import the scheme or remember slash conventions.
 */
export const appUrl = (...pathParts: Array<string | number | undefined>): string =>
  joinUrl(appLinkPrefix, ...pathParts);

/**
 * Build a deep link into the Twitarr Site UI (WebView).
 * Prefixes `twitarrtab` and a cache-busting timestamp so the WebView reloads, then joins any extra path like appUrl.
 */
export const appSiteUrl = (...pathParts: Array<string | number | undefined>): string =>
  appUrl('twitarrtab', Date.now(), ...pathParts);

/**
 * Path, query, and hash from a web URL or relative path, without a leading slash.
 * `https://twitarr.com/forum/abc?foo=1#bar` becomes `forum/abc?foo=1#bar`.
 * `/events/123` becomes `events/123`.
 */
export const extractPathFromWebUrl = (url: string): string => {
  if (url.startsWith('/')) {
    return url.replace(/^\//, '');
  }
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`.replace(/^\//, '');
  } catch {
    return url.replace(/^\//, '');
  }
};

/**
 * Extract the path (with query string) from a tricordarr:// URL.
 * Returns undefined if the URL doesn't match the expected format.
 *
 * @param url - Full URL like "tricordarr://forum/abc123?param=value" or "tricordarr:/forum/abc123"
 * @returns The path portion with query string, e.g., "forum/abc123?param=value"
 */
export const extractPathFromTricordarrUrl = (url: string): string | undefined => {
  if (url.startsWith(appLinkPrefix)) {
    return url.slice(appLinkPrefix.length);
  }
  // Older conversions used tricordarr:/ plus the remaining path slash.
  // @TODO do we still need this?
  if (url.startsWith('tricordarr:/')) {
    return url.slice('tricordarr:/'.length);
  }
  return undefined;
};

/**
 * True when the URL should be opened as an in-app Twitarr deep link rather than externally.
 *
 * - Relative path: `/events/123` from markdown or the site UI — always a Twitarr route.
 * - App scheme: `tricordarr://puzzle/...` share links and in-app deep links.
 * - Configured server: absolute URL that starts with `serverUrl`.
 * - Canonical host: hostname listed in `canonicalHostnames` (e.g. twitarr.com).
 */
export const isTwitarrUrl = (url: string, serverUrl: string, canonicalHostnames: string[]): boolean => {
  // Relative path from markdown or the site UI.
  if (url.startsWith('/')) {
    return true;
  }
  // In-app deep link (appLinkPrefix, e.g. tricordarr://).
  if (url.startsWith(appLinkPrefix)) {
    return true;
  }
  // Absolute URL on the server this app is currently using.
  if (url.startsWith(serverUrl)) {
    return true;
  }
  // Public Twitarr hostname from the canonical list.
  return canonicalHostnames.includes(new URLParse(url).hostname);
};
