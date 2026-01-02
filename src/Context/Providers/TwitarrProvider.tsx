import React, {PropsWithChildren, useCallback} from 'react';
import {Linking} from 'react-native';
import URLParse from 'url-parse';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {TwitarrContext} from '#src/Context/Contexts/TwitarrContext';
import {isNavigationReady, push} from '#src/Libraries/NavigationRef';
import {extractPathFromTricordarrUrl, parseDeepLinkUrl} from '#src/Libraries/UrlParser';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  const {setErrorBanner} = useErrorHandler();

  /**
   * Transform a URL path for the app's deep linking scheme.
   * Handles /fez -> /lfg translation.
   *
   * Attempts to use push navigation for a better back button experience.
   * Falls back to Linking.openURL() if the URL can't be parsed or navigation isn't ready.
   */
  const openAppUrl = useCallback(
    (appUrl: string, queryParams?: Record<string, string | number | boolean>) => {
      // Build URL with query parameters if provided
      let finalUrl = appUrl;
      if (queryParams && Object.keys(queryParams).length > 0) {
        const queryString = Object.entries(queryParams)
          .map(([key, value]) => {
            const stringValue =
              typeof value === 'boolean' ? String(value) : typeof value === 'number' ? String(value) : value;
            return `${encodeURIComponent(key)}=${encodeURIComponent(stringValue)}`;
          })
          .join('&');
        finalUrl = `${appUrl}?${queryString}`;
      }

      // Handle /fez -> /lfg translation
      if (finalUrl.includes('/fez')) {
        finalUrl = finalUrl.replace('/fez', '/lfg');
      }

      // Try to use push navigation for better back button behavior
      const path = extractPathFromTricordarrUrl(finalUrl);
      if (path && isNavigationReady()) {
        const parsed = parseDeepLinkUrl(path);
        if (parsed) {
          console.log('[TwitarrProvider.tsx] Push navigating to', parsed.screen, parsed.params);
          push(parsed.screen, parsed.params);
          return;
        }
      }

      // Fall back to Linking.openURL() for unrecognized routes
      console.log('[TwitarrProvider.tsx] Falling back to Linking.openURL for', finalUrl);
      Linking.openURL(finalUrl).catch(err => {
        console.error('[TwitarrProvider.tsx] Failed to open URL:', finalUrl, err);
        setErrorBanner('Failed to open URL: ' + finalUrl);
      });
    },
    [setErrorBanner],
  );

  /**
   * Open a Twitarr URL. This handles:
   * - Relative URLs (starting with /) by converting to tricordarr:// deep links
   * - URLs matching the current server or canonical hostnames
   * - External URLs (opened directly)
   *
   * This would normally get covered by Android App Links
   * https://developer.android.com/training/app-links but verifying a non-public
   * server is a problem, and it's a lot of work. Plus I want to translate certain URLs
   * until we fix the upstream. So this exists.
   *
   * https://github.com/jocosocial/tricordarr/issues/252
   */
  const openWebUrl = useCallback(
    (url: string) => {
      // Handle relative URLs (e.g., /events/123)
      if (url.startsWith('/')) {
        // Remove leading slash since the deep link config doesn't expect it
        const appUrl = `tricordarr://${url.substring(1)}`;
        openAppUrl(appUrl);
        return;
      }

      // Handle absolute URLs
      const linkUrlObject = new URLParse(url);
      if (url.startsWith(serverUrl)) {
        const appUrl = url.replace(serverUrl, 'tricordarr:/');
        openAppUrl(appUrl);
        return;
      } else if (appConfig.apiClientConfig.canonicalHostnames.includes(linkUrlObject.hostname)) {
        // Apparently protocol includes the colon.
        const appUrl = url.replace(`${linkUrlObject.protocol}//${linkUrlObject.hostname}`, 'tricordarr:/');
        openAppUrl(appUrl);
        return;
      }

      // External URL - open directly
      Linking.openURL(url).catch(err => {
        console.error('[TwitarrProvider.tsx] Failed to open external URL:', url, err);
        setErrorBanner('Failed to open URL: ' + url);
      });
    },
    [serverUrl, appConfig.apiClientConfig.canonicalHostnames, openAppUrl, setErrorBanner],
  );

  return (
    <TwitarrContext.Provider
      value={{
        openWebUrl,
        openAppUrl,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
