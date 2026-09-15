import {useQueryClient} from '@tanstack/react-query';
import React, {PropsWithChildren, useCallback} from 'react';

import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {ConfirmLogoutOptions, SignOutContext, SignOutContextType} from '#src/Context/Contexts/SignOutContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {WebSocketStorageActions} from '#src/Context/Reducers/Fez/FezSocketReducer';
import {useTwitarrWebview} from '#src/Hooks/useTwitarrWebview';
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
 *   2. performSignOut — clear token, sockets, query cache, cookies
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
  const queryClient = useQueryClient();
  const {clearCookies} = useTwitarrWebview();

  /**
   * Local session teardown. Order inside matters: disable notifications before
   * clearing the token so PushNotificationService does not restart FGS without
   * credentials; clear the query cache after `signOut()` so logged-in widgets
   * (Today appointments, avatar, etc.) drop before any later navigation.
   */
  const performSignOut = useCallback(async () => {
    // Disable user notifications. Push provider teardown (stopPushProvider) is handled by
    // PushNotificationService when this state flips: its effect calls stopPushProvider() once.
    // We do not call stopPushProvider() here to avoid duplicate clearSettings on iOS and
    // NEAppPushManager "configuration is unchanged" errors.
    setEnableUserNotifications(false);

    // Close notification socket
    closeNotificationSocket();

    // Clear all Fez sockets
    dispatchFezSockets({
      type: WebSocketStorageActions.clear,
    });

    // Sign out from session (clears token data)
    await signOut();

    // Clear React Query cache
    queryClient.clear();

    // Clear webview cookies
    await clearCookies();
  }, [setEnableUserNotifications, closeNotificationSocket, dispatchFezSockets, signOut, queryClient, clearCookies]);

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
