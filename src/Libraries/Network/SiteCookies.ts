import CookieManager from '@preeternal/react-native-cookie-manager';

import {createLogger} from '#src/Libraries/Logger';
import {isIOS} from '#src/Libraries/Platform/Detection';

const logger = createLogger('SiteCookies.ts');

const COOKIE_NAME = 'swiftarr_session';

/**
 * Extracts the swiftarr_session cookie value from a Set-Cookie header (or several).
 * The header format is: swiftarr_session=value; path=/; ...
 */
export const extractSessionCookie = (setCookieHeader: string | string[] | undefined): string | null => {
  if (!setCookieHeader) {
    return null;
  }
  const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  for (const header of headers) {
    const match = header.match(/swiftarr_session=([^;]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

/**
 * Put a swiftarr_session cookie value in the OS cookie jar for a server. The jar holds one such
 * cookie per server domain, so setting it replaces whichever account had it before.
 */
export const setSiteCookie = async (serverUrl: string, value: string): Promise<void> => {
  logger.info('Setting swiftarr_session cookie for server URL.', serverUrl);
  await CookieManager.set(serverUrl, {name: COOKIE_NAME, value, path: '/'}, isIOS);
};

/**
 * Remove the swiftarr_session cookie for one server, leaving every other server's alone. On iOS
 * this clears both NSHTTPCookieStorage and WKHTTPCookieStore (the second argument chooses the
 * store), which was needed for cookies to actually clear on sign out.
 */
export const clearSiteCookie = async (serverUrl: string): Promise<void> => {
  if (isIOS) {
    await CookieManager.clearByName(serverUrl, COOKIE_NAME, false);
    await CookieManager.clearByName(serverUrl, COOKIE_NAME, true);
  } else {
    await CookieManager.clearByName(serverUrl, COOKIE_NAME);
  }
};
