import React, {PropsWithChildren, useCallback} from 'react';

import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {ConfirmLogoutOptions, SignOutContext, SignOutContextType} from '#src/Context/Contexts/SignOutContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {WebSocketStorageActions} from '#src/Context/Reducers/Fez/FezSocketReducer';
import {alertLogout} from '#src/Libraries/Alerts/AuthAlerts';
import {useLogoutMutation} from '#src/Queries/Auth/LogoutMutations';

/**
 * SignOutProvider consolidates sign-out into `performSignOut` / `confirmLogout`.
 *
 * Placement: after ConfigProvider, SessionProvider, EnableUserNotificationProvider,
 * SocketProvider, and SwiftarrQueryClientProvider.
 *
 * Confirmed logout must run in this order (see ConfirmLogoutOptions):
 *   1. onLogoutStart — freeze the visible screen's logged-in UI
 *   2. performSignOut — clear token, sockets (the scope remount drops the query cache)
 *   3. onLoggedOut — navigate (usually goBack)
 *
 * Navigating in (1) reveals Today/Settings still logged-in. Teardown without (1)
 * flashes NotLoggedInView on the current screen. Alert.alert (unlike the old
 * Modal) is gone as soon as the user confirms, so nothing hides those swaps.
 */
export const SignOutProvider = ({children}: PropsWithChildren) => {
  const {setEnableUserNotifications} = useEnableUserNotification();
  const {closeNotificationSocket, dispatchFezSockets} = useSocket();
  const {signOut} = useSession();

  /**
   * Local sign-out of the current account. Signing out switches to the next most recently used
   * account (or the anonymous session for the server), which remounts the session scope: the
   * query client, sockets and the cache file go with the old one, and AccountCookieSync puts the
   * right webview cookie back. What is left to do here is stopping notifications first. Disable
   * user notifications and close the sockets before clearing the token so PushNotificationService
   * does not restart FGS without credentials. The push provider itself is stopped by
   * SessionProvider.signOut, ahead of the switch, since this scope will not be around to react
   * to the state flip.
   */
  const performSignOut = useCallback(async () => {
    setEnableUserNotifications(false);

    // Close notification socket
    closeNotificationSocket();

    // Clear all Fez sockets
    dispatchFezSockets({
      type: WebSocketStorageActions.clear,
    });

    // Sign the current account out (clears its token, keeps the row)
    await signOut();
  }, [setEnableUserNotifications, closeNotificationSocket, dispatchFezSockets, signOut]);

  /**
   * Freeze current UI, tear down session+cache, then navigate. Must not reorder:
   * goBack-before-teardown flashes leftover Today content; teardown-before-freeze
   * flashes NotLoggedInView on the current screen. See ConfirmLogoutOptions.
   */
  const finishLogout = useCallback(
    async (onLogoutStart?: () => void, onLoggedOut?: () => void) => {
      onLogoutStart?.();
      await performSignOut();
      onLoggedOut?.();
    },
    [performSignOut],
  );

  const logoutMutation = useLogoutMutation();

  /**
   * Alert confirm, then finishLogout. All-devices waits for POST /auth/logout
   * success before teardown so a failed API leaves the user on this screen
   * still logged in. This provider cannot call useNavigation() (it sits above
   * the root navigator; see docs/Navigation.md).
   */
  const confirmLogout = useCallback(
    (options?: ConfirmLogoutOptions) => {
      const allDevices = options?.allDevices ?? false;
      const onLogoutStart = options?.onLogoutStart;
      const onLoggedOut = options?.onLoggedOut;
      alertLogout(allDevices, () => {
        if (allDevices) {
          logoutMutation.mutate(undefined, {onSuccess: () => finishLogout(onLogoutStart, onLoggedOut)});
        } else {
          finishLogout(onLogoutStart, onLoggedOut);
        }
      });
    },
    [finishLogout, logoutMutation],
  );

  const contextValue: SignOutContextType = React.useMemo(
    () => ({
      performSignOut,
      confirmLogout,
    }),
    [performSignOut, confirmLogout],
  );

  return <SignOutContext.Provider value={contextValue}>{children}</SignOutContext.Provider>;
};
