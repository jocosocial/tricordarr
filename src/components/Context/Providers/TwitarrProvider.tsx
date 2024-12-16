import {TwitarrContext} from '../Contexts/TwitarrContext';
import React, {PropsWithChildren} from 'react';
import {useConfig} from '../Contexts/ConfigContext';
import {Linking} from 'react-native';
import URLParse from 'url-parse';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();

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
    if (url.startsWith(appConfig.serverUrl)) {
      let appUrl = url.replace(appConfig.serverUrl, 'tricordarr:/');
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

  return (
    <TwitarrContext.Provider
      value={{
        openWebUrl,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
