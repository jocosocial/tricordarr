import {useEffect} from 'react';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {createLogger} from '#src/Libraries/Logger';
import {clearSiteCookie, setSiteCookie} from '#src/Libraries/Network/SiteCookies';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';

const logger = createLogger('AccountCookieSync.tsx');

/**
 * Makes the OS cookie jar match the active session. The jar keeps one swiftarr_session cookie per
 * server domain, so two accounts on the same server cannot both stay logged in to the webview:
 * whenever the session changes, put the active account's stored cookie back, or clear the
 * server's cookie if the session is anonymous or the account has none.
 */
export const AccountCookieSync = () => {
  const {currentSession, currentAccount, isLoggedIn} = useSession();
  const serverUrl = currentSession?.serverUrl;
  const accountID = isLoggedIn ? currentAccount?.accountID : undefined;

  useEffect(() => {
    if (!serverUrl) {
      return;
    }
    const sync = async () => {
      const cookie = accountID ? await SessionStorage.getCookieForAccount(accountID) : null;
      if (cookie) {
        await setSiteCookie(serverUrl, cookie);
      } else {
        await clearSiteCookie(serverUrl);
      }
    };
    sync().catch(error => logger.error('Failed to sync webview cookie:', error));
  }, [serverUrl, accountID]);

  return null;
};
