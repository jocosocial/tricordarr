import {useLinkTo} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import {Linking} from 'react-native';

import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAccountSwitcher} from '#src/Hooks/useAccountSwitcher';
import {createLogger} from '#src/Libraries/Logger';
import {navigationRef} from '#src/Libraries/NavigationRef';
import {
  clearAccountLink,
  consumeAccountLink,
  getLinkAccountID,
  isOtherAccountLink,
  stashAccountLink,
  stripLinkAccount,
} from '#src/Libraries/Notifications/AccountLink';
import {extractPathFromTricordarrUrl} from '#src/Libraries/UrlParser';

const logger = createLogger('AccountLinkHandler.tsx');

// The URL that launched the app is still reported after a session switch remounts this component,
// so remember which one has been dealt with at module scope.
let handledInitialUrl: string | null | undefined = null;

const NAVIGATION_READY_ATTEMPTS = 20;
const NAVIGATION_READY_INTERVAL_MS = 50;

/**
 * High level functional component that opens a link in the session it was meant for. For a
 * notification tap, NavigationProvider's linking filter drops a link addressed to another account;
 * this switches to that account. For a universal link, ForeignLinkHandler holds the link until the
 * user lands on its server. Either way the link opens once the new session has mounted.
 */
export const AccountLinkHandler = () => {
  const {accounts, currentAccount, currentSession} = useSession();
  const {oobeCompleted, resumeMode} = useOobe();
  const {switchAccount} = useAccountSwitcher();
  const {setSnackbarPayload} = useSnackbar();
  const linkTo = useLinkTo();
  const currentAccountID = currentAccount?.accountID ?? null;
  const currentServerUrl = currentSession?.serverUrl;
  // linkTo changes identity as navigation settles after a switch. Keeping it in a ref lets the
  // effect below depend only on the account, so it is not re-run (and its retry timer cancelled)
  // after it has already taken the held link.
  const linkToRef = useRef(linkTo);
  useEffect(() => {
    linkToRef.current = linkTo;
  }, [linkTo]);

  const handleUrl = useCallback(
    (url: string | null | undefined) => {
      if (!url || !oobeCompleted || !isOtherAccountLink(url, currentAccountID)) {
        return;
      }
      const account = accounts.find(a => a.accountID === getLinkAccountID(url));
      if (!account) {
        logger.info('Received link for an account that is not on this device', url);
        setSnackbarPayload({
          message: 'That notification was for an account that is no longer on this device.',
          messageType: 'info',
        });
        return;
      }
      logger.info('Received link for another account, switching to', account.accountID);
      stashAccountLink(account.accountID, stripLinkAccount(url));
      // A signed-out account goes to the login form, and the link is kept for the sign-in.
      switchAccount(account)
        .then(result => {
          if (result === 'ignored') {
            clearAccountLink();
          }
        })
        .catch(error => {
          clearAccountLink();
          logger.error('Failed to switch account for link', error);
        });
    },
    [oobeCompleted, currentAccountID, accounts, switchAccount, setSnackbarPayload],
  );

  useEffect(() => {
    Linking.getInitialURL()
      .then(url => {
        if (url === handledInitialUrl) {
          return;
        }
        handledInitialUrl = url;
        handleUrl(url);
      })
      .catch(err => logger.error('Failed to read initial URL', err));
  }, [handleUrl]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({url}) => handleUrl(url));
    return () => subscription.remove();
  }, [handleUrl]);

  // Open the link that caused the switch into this session. The root navigator mounts alongside
  // this component, so wait for it before navigating. The held link is taken exactly once, so the
  // retry timer below must survive anything but the session (or the component) changing. While the
  // setup flow is still running (resumeMode), the link waits: opening it now would navigate
  // underneath the flow.
  useEffect(() => {
    if (resumeMode) {
      return;
    }
    const url = consumeAccountLink({accountID: currentAccountID, serverUrl: currentServerUrl});
    const path = url ? extractPathFromTricordarrUrl(url) : undefined;
    if (path === undefined) {
      return;
    }
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const open = () => {
      if (navigationRef.isReady()) {
        logger.debug('Opening link after account switch', path);
        linkToRef.current(`/${path}`);
      } else if (attempts++ < NAVIGATION_READY_ATTEMPTS) {
        timer = setTimeout(open, NAVIGATION_READY_INTERVAL_MS);
      } else {
        logger.warn('Navigation never became ready, dropping link', path);
      }
    };
    open();
    return () => clearTimeout(timer);
  }, [currentAccountID, currentServerUrl, resumeMode]);

  // Void is not a valid React component.
  return null;
};
