import {useCallback, useEffect, useRef} from 'react';
import {Linking} from 'react-native';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {alertForeignLink} from '#src/Libraries/Alerts/LinkAlerts';
import {createLogger} from '#src/Libraries/Logger';
import {isForeignAppLink} from '#src/Libraries/UrlParser';

const logger = createLogger('ForeignLinkHandler.tsx');

/**
 * High level functional component that tells the user when the OS hands the app a link for a
 * server this session isn't using. NavigationProvider's linking filter drops those links so they
 * don't navigate, and that filter stays a plain check with no UI, which is why this is separate.
 * Stays quiet until OOBE is done, since the server choice isn't final until then.
 */
export const ForeignLinkHandler = () => {
  const {appConfig} = useConfig();
  const {oobeCompleted} = useOobe();
  const {serverUrl} = useSwiftarrQueryClient();
  const canonicalHostnames = appConfig.apiClientConfig.canonicalHostnames;
  // A later server change must not alert again for the link that launched the app.
  const checkedInitialUrl = useRef(false);

  const handleUrl = useCallback(
    (url: string | null) => {
      if (url && oobeCompleted && isForeignAppLink(url, serverUrl, canonicalHostnames)) {
        logger.info('Received link for another server', url);
        alertForeignLink(url, serverUrl);
      }
    },
    [oobeCompleted, serverUrl, canonicalHostnames],
  );

  useEffect(() => {
    if (checkedInitialUrl.current) {
      return;
    }
    checkedInitialUrl.current = true;
    Linking.getInitialURL()
      .then(handleUrl)
      .catch(err => logger.error('Failed to read initial URL', err));
  }, [handleUrl]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({url}) => handleUrl(url));
    return () => subscription.remove();
  }, [handleUrl]);

  // Void is not a valid React component.
  return null;
};
