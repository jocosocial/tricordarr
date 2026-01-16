import CookieManager from '@react-native-cookies/cookies';
import {useCallback} from 'react';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {isIOS} from '#src/Libraries/Platform/Detection';
import {usePublicMutation} from '#src/Queries/PublicMutation';
import {LoginFormValues} from '#src/Types/FormValues';

/**
 * Hook for handling webview-based login that sets cookies.
 * Returns a signIn function that calls the /login endpoint and extracts
 * the swiftarr_session cookie from the response to set it with CookieManager.
 */
export const useTwitarrWebview = () => {
  const {publicPost, serverUrl} = useSwiftarrQueryClient();

  /**
   * Extracts the swiftarr_session cookie value from the Set-Cookie header.
   * The Set-Cookie header format is: swiftarr_session=value; path=/; ...
   */
  const extractCookieValue = useCallback((setCookieHeader: string | string[] | undefined): string | null => {
    if (!setCookieHeader) {
      return null;
    }

    // Handle array of Set-Cookie headers (some servers send multiple)
    const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

    for (const header of headers) {
      // Find the swiftarr_session cookie
      const match = header.match(/swiftarr_session=([^;]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }, []);

  const siteLoginMutation = usePublicMutation(
    useCallback(
      async (loginValues: LoginFormValues) => {
        const response = await publicPost<string, LoginFormValues>('/login', loginValues, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Extract the cookie from Set-Cookie header
        // Note: axios lowercases header names, so it's 'set-cookie' not 'Set-Cookie'
        const setCookieHeader = response.headers['set-cookie'];
        const cookieValue = extractCookieValue(setCookieHeader);

        if (cookieValue) {
          console.log('[useTwitarrWebview.ts] Setting swiftarr_session cookie for serverUrl', serverUrl);
          // Set the cookie using CookieManager
          await CookieManager.set(
            serverUrl,
            {
              name: 'swiftarr_session',
              value: cookieValue,
              path: '/',
              // Domain will be automatically determined from the URL
            },
            isIOS,
          );
        } else {
          console.warn('[useTwitarrWebview] No swiftarr_session cookie found in response');
        }

        return response.data;
      },
      [publicPost, serverUrl, extractCookieValue],
    ),
  );

  const signIn = useCallback(
    (loginValues: LoginFormValues) => {
      return siteLoginMutation.mutate(loginValues);
    },
    [siteLoginMutation],
  );

  /**
   * Clears all cookies. On iOS, clears both NSHTTPCookieStorage and WKHTTPCookieStore.
   * clearAll(true) clears WKHTTPCookieStore, clearAll(false) clears NSHTTPCookieStorage.
   *
   * This was having issues on iOS with cookies not clearing on signOut.
   */
  const clearCookies = useCallback(async () => {
    if (isIOS) {
      await CookieManager.clearAll(false); // Clear NSHTTPCookieStorage
      await CookieManager.clearAll(true); // Clear WKHTTPCookieStore
    } else {
      await CookieManager.clearAll();
    }
  }, []);

  return {
    signIn,
    clearCookies,
  };
};
