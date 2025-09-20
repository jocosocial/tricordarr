import {TwitarrContext} from '#src/Context/Contexts/TwitarrContext.ts';
import React, {PropsWithChildren} from 'react';
import {useConfig} from '#src/Context/Contexts/ConfigContext.ts';
import {Linking} from 'react-native';
import URLParse from 'url-parse';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext.ts';
// import {useAuth} from '#src/Context/Contexts/AuthContext.ts';
// import {useUserProfileQuery} from '#src/Queries/User/UserQueries.ts';
// import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext.ts';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  // const {tokenData} = useAuth();
  // const {error: profileQueryError} = useUserProfileQuery({
  //   enabled: !!tokenData,
  // });
  // const {setErrorBanner} = useErrorHandler();

  const openAppUrl = (appUrl: string) => {
    if (appUrl.includes('/fez')) {
      appUrl = appUrl.replace('/fez', '/lfg');
    }
    console.log('[TwitarrProvider.tsx] Opening reformed URL', appUrl);
    Linking.openURL(appUrl);
  };

  /**
   * Open a Twitarr URL. This would normally get covered by Android App Links
   * https://developer.android.com/training/app-links but verifying a non-public
   * server is a problem, and it's a lot of work. Plus I want to translate certain URLs
   * until we fix the upstream. So this exists.
   * @param url
   */
  const openWebUrl = (url: string) => {
    const linkUrlObject = new URLParse(url);
    if (url.startsWith(serverUrl)) {
      let appUrl = url.replace(serverUrl, 'tricordarr:/');
      openAppUrl(appUrl);
      return;
    } else if (appConfig.apiClientConfig.canonicalHostnames.includes(linkUrlObject.hostname)) {
      // Apparently protocol includes the colon.
      let appUrl = url.replace(`${linkUrlObject.protocol}//${linkUrlObject.hostname}`, 'tricordarr:/');
      openAppUrl(appUrl);
      return;
    }
    Linking.openURL(url);
  };

  // @TODO sus
  // useEffect(() => {
  //   if (tokenData && profileQueryError && profileQueryError.response) {
  //     if (profileQueryError.response.status === 401) {
  //       setErrorBanner('You are not logged in (or your token is no longer valid). Please log in again.');
  //     }
  //   }
  // }, [profileQueryError, setErrorBanner, tokenData]);

  return (
    <TwitarrContext.Provider
      value={{
        openWebUrl,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
