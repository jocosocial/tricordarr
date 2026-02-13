import {CacheManager} from '@georstat/react-native-image-cache';
import {useQueryClient} from '@tanstack/react-query';
import React, {PropsWithChildren, useCallback} from 'react';

import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {SignOutContext, SignOutContextType} from '#src/Context/Contexts/SignOutContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {WebSocketStorageActions} from '#src/Context/Reducers/Fez/FezSocketReducer';
import {useTwitarrWebview} from '#src/Hooks/useTwitarrWebview';

/**
 * SignOutProvider consolidates all sign-out logic into a single performSignOut function.
 * This ensures consistent sign-out behavior across the app and eliminates code duplication.
 *
 * This provider must be placed after all the providers it depends on:
 * - SessionProvider (for signOut)
 * - EnableUserNotificationProvider (for setEnableUserNotifications)
 * - SocketProvider (for closeNotificationSocket, dispatchFezSockets)
 * - PrivilegeProvider (for clearPrivileges)
 * - SwiftarrQueryClientProvider (for queryClient via useQueryClient)
 */
export const SignOutProvider = ({children}: PropsWithChildren) => {
  const {setEnableUserNotifications} = useEnableUserNotification();
  const {closeNotificationSocket, dispatchFezSockets} = useSocket();
  const {signOut} = useSession();
  const {clearPrivileges} = usePrivilege();
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

    // Clear privileges
    clearPrivileges();

    // Clear React Query cache
    queryClient.clear();

    // Clear image cache
    await CacheManager.clearCache();

    // Clear webview cookies
    await clearCookies();
  }, [
    setEnableUserNotifications,
    closeNotificationSocket,
    dispatchFezSockets,
    signOut,
    clearPrivileges,
    queryClient,
    clearCookies,
  ]);

  const contextValue: SignOutContextType = React.useMemo(
    () => ({
      performSignOut,
    }),
    [performSignOut],
  );

  return <SignOutContext.Provider value={contextValue}>{children}</SignOutContext.Provider>;
};
