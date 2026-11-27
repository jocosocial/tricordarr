import React, {useCallback, useEffect, useState} from 'react';
import {Linking} from 'react-native';

import {ForeignLinkSheet} from '#src/Components/Sheets/ForeignLinkSheet';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useAccountSwitcher} from '#src/Hooks/useAccountSwitcher';
import {createLogger} from '#src/Libraries/Logger';
import {clearAccountLink, stashServerLink} from '#src/Libraries/Notifications/AccountLink';
import {appUrl, extractPathFromWebUrl, findLinkCandidates, isForeignAppLink} from '#src/Libraries/UrlParser';

const logger = createLogger('ForeignLinkHandler.tsx');

// The URL that launched the app is still reported after a session switch remounts this component,
// so remember that it has been checked at module scope. Otherwise every switch would re-prompt.
let checkedInitialUrl = false;

/**
 * High level functional component that routes a link for a server this session isn't using to an
 * account on this device. NavigationProvider's linking filter drops those links so they don't
 * navigate, and that filter stays a plain check with no UI, which is why this is separate.
 * Switches straight to the account when it is the only match, otherwise asks. Stays quiet until
 * OOBE is done, since the server choice isn't final until then.
 */
export const ForeignLinkHandler = () => {
  const {appConfig} = useConfig();
  const {oobeCompleted} = useOobe();
  const {serverUrl} = useSwiftarrQueryClient();
  const {accounts, sessions, serverProfiles} = useSession();
  const {switchAccount} = useAccountSwitcher();
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const canonicalHostnames = appConfig.canonicalHostnames;

  const handleUrl = useCallback(
    (url: string | null | undefined) => {
      if (!url || !oobeCompleted || !isForeignAppLink(url, serverUrl, canonicalHostnames)) {
        return;
      }
      logger.info('Received link for another server', url);
      const candidates = findLinkCandidates(url, accounts, sessions, serverProfiles);
      const only = candidates.length === 1 ? candidates[0] : undefined;
      if (only?.kind === 'account' && only.account.status === 'signedIn') {
        stashServerLink(only.account.serverUrl, appUrl(extractPathFromWebUrl(url)));
        switchAccount(only.account)
          .then(result => {
            if (result !== 'switched') {
              clearAccountLink();
            }
          })
          .catch(error => {
            clearAccountLink();
            logger.error('Failed to switch account for link', error);
          });
        return;
      }
      setSheetUrl(url);
    },
    [oobeCompleted, serverUrl, canonicalHostnames, accounts, sessions, serverProfiles, switchAccount],
  );

  useEffect(() => {
    if (checkedInitialUrl) {
      return;
    }
    checkedInitialUrl = true;
    Linking.getInitialURL()
      .then(handleUrl)
      .catch(err => logger.error('Failed to read initial URL', err));
  }, [handleUrl]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({url}) => handleUrl(url));
    return () => subscription.remove();
  }, [handleUrl]);

  if (!sheetUrl) {
    return null;
  }
  return (
    <ForeignLinkSheet
      url={sheetUrl}
      candidates={findLinkCandidates(sheetUrl, accounts, sessions, serverProfiles)}
      isPresented
      onDismiss={() => setSheetUrl(null)}
    />
  );
};
