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
 * SignOutProvider consolidates all sign-out logic into a single performSignOut function.
 * This ensures consistent sign-out behavior across the app and eliminates code duplication.
 *
 * This provider must be placed after all the providers it depends on:
 * - ConfigProvider (for updateAppConfig)
 * - SessionProvider (for signOut)
 * - EnableUserNotificationProvider (for setEnableUserNotifications)
 * - SocketProvider (for closeNotificationSocket, dispatchFezSockets)
 * - SwiftarrQueryClientProvider (for queryClient via useQueryClient)
 */
export const SignOutProvider = ({children}: PropsWithChildren) => {
  const {setEnableUserNotifications} = useEnableUserNotification();
  const {closeNotificationSocket, dispatchFezSockets} = useSocket();
  const {signOut} = useSession();
  const queryClient = useQueryClient();
  const {clearCookies} = useTwitarrWebview();

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

  const finishLogout = useCallback(
    async (onLoggedOut?: () => void) => {
      await performSignOut();
      onLoggedOut?.();
    },
    [performSignOut],
  );

  const logoutMutation = useLogoutMutation();

  // SignOutProvider is rendered above the root navigator (see docs/Navigation.md), so it
  // cannot safely call useNavigation() itself. Callers pass their own screen-scoped
  // onLoggedOut callback (e.g. () => navigation.goBack()) instead.
  const confirmLogout = useCallback(
    (options?: ConfirmLogoutOptions) => {
      const allDevices = options?.allDevices ?? false;
      const onLoggedOut = options?.onLoggedOut;
      alertLogout(allDevices, () => {
        if (allDevices) {
          logoutMutation.mutate(undefined, {onSuccess: () => finishLogout(onLoggedOut)});
        } else {
          finishLogout(onLoggedOut);
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
