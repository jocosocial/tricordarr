import axios from 'axios';
import {useCallback} from 'react';
import DeviceInfo from 'react-native-device-info';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {createLogger} from '#src/Libraries/Logger';
import {clearSiteCookie, extractSessionCookie, setSiteCookie} from '#src/Libraries/Network/SiteCookies';
import {joinUrl} from '#src/Libraries/UrlParser';
import {LoginFormValues} from '#src/Types/FormValues';

const logger = createLogger('useTwitarrWebview.ts');

/**
 * Hook for the webview's cookie session. `siteLogin` calls the site's /login endpoint on an
 * explicit server and sets the swiftarr_session cookie from the response; `clearCookies` removes
 * the cookie for one server (the current one by default) rather than every server's.
 */
export const useTwitarrWebview = () => {
  const {serverUrl: currentServerUrl} = useSwiftarrQueryClient();
  const {appConfig} = useConfig();

  /**
   * Log in to the site on `serverUrl` and set the cookie. Returns the raw cookie value so the
   * caller can store it against the account, or null if the login failed or sent no cookie. A
   * failure here is logged, not thrown: the API login already succeeded and only the webview
   * (Site UI screens) is affected.
   */
  const siteLogin = useCallback(
    async (loginValues: LoginFormValues, serverUrl: string = currentServerUrl): Promise<string | null> => {
      try {
        const response = await axios.post<string>(joinUrl(serverUrl, '/login'), loginValues, {
          headers: {
            'Content-Type': 'application/json',
            'X-Swiftarr-Client': `${DeviceInfo.getApplicationName()} ${DeviceInfo.getVersion()}`,
            'Cache-Control': 'no-store',
          },
          timeout: appConfig.apiClientConfig.mutationTimeout,
        });
        // Note: axios lowercases header names, so it's 'set-cookie' not 'Set-Cookie'
        const cookieValue = extractSessionCookie(response.headers['set-cookie']);
        if (!cookieValue) {
          logger.warn('No swiftarr_session cookie found in response');
          return null;
        }
        await setSiteCookie(serverUrl, cookieValue);
        return cookieValue;
      } catch (error) {
        logger.warn('Site login failed:', error);
        return null;
      }
    },
    [currentServerUrl, appConfig.apiClientConfig.mutationTimeout],
  );

  /**
   * Clears the swiftarr_session cookie for a server (the current one by default).
   */
  const clearCookies = useCallback(
    async (serverUrl: string = currentServerUrl) => {
      await clearSiteCookie(serverUrl);
    },
    [currentServerUrl],
  );

  return {
    siteLogin,
    clearCookies,
  };
};
