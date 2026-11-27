import React, {PropsWithChildren, useCallback, useEffect, useState} from 'react';
import {Permission, PermissionsAndroid, Platform} from 'react-native';
import {
  checkNotifications,
  check as checkPermission,
  PERMISSIONS,
  PermissionStatus,
  request as requestPermission,
  RESULTS,
} from 'react-native-permissions';

import {PermissionsContext} from '#src/Context/Contexts/PermissionsContext';
import {createLogger} from '#src/Libraries/Logger';
import {isAndroid, isIOS} from '#src/Libraries/Platform/Detection';

const logger = createLogger('PermissionsProvider.tsx');

const microphonePermission = isIOS ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;

// Not in the PermissionsAndroid constants or react-native-permissions yet.
const LOCAL_NETWORK_PERMISSION = 'android.permission.ACCESS_LOCAL_NETWORK' as Permission;

/**
 * Android 17 (API 37) blocks traffic to local network addresses, including the ship server, until
 * the user grants ACCESS_LOCAL_NETWORK. Earlier Android versions and iOS don't have the permission.
 */
const localNetworkPermissionRequired = isAndroid && Number(Platform.Version) >= 37;

export const PermissionsProvider = ({children}: PropsWithChildren) => {
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<PermissionStatus | undefined>();
  const [microphonePermissionStatus, setMicrophonePermissionStatus] = useState<PermissionStatus | undefined>();
  const [localNetworkPermissionStatus, setLocalNetworkPermissionStatus] = useState<PermissionStatus | undefined>();

  useEffect(() => {
    checkNotifications()
      .then(({status}) => {
        setHasNotificationPermission(status === RESULTS.GRANTED);
        setNotificationPermissionStatus(status);
      })
      .catch(error => logger.error('Failed to check notification permission', error));
  }, []);

  const checkMicrophonePermission = useCallback(async () => {
    const status = await checkPermission(microphonePermission);
    setMicrophonePermissionStatus(status);
  }, []);

  useEffect(() => {
    checkMicrophonePermission().catch(error => logger.error('Failed to check microphone permission', error));
  }, [checkMicrophonePermission]);

  const requestMicrophonePermission = useCallback(async () => {
    const status = await requestPermission(microphonePermission);
    setMicrophonePermissionStatus(status);
    return status;
  }, []);

  /**
   * Reads the local network permission. Reports UNAVAILABLE where the platform doesn't require it.
   */
  const checkLocalNetworkPermission = useCallback(async () => {
    if (!localNetworkPermissionRequired) {
      setLocalNetworkPermissionStatus(RESULTS.UNAVAILABLE);
      return;
    }
    const granted = await PermissionsAndroid.check(LOCAL_NETWORK_PERMISSION);
    setLocalNetworkPermissionStatus(granted ? RESULTS.GRANTED : RESULTS.DENIED);
  }, []);

  useEffect(() => {
    checkLocalNetworkPermission().catch(error => logger.error('Failed to check local network permission', error));
  }, [checkLocalNetworkPermission]);

  /**
   * Asks for the local network permission. Without it, connections to the ship server time out on
   * Android 17, so this is asked on the server step of setup.
   */
  const requestLocalNetworkPermission = useCallback(async (): Promise<PermissionStatus> => {
    if (!localNetworkPermissionRequired) {
      setLocalNetworkPermissionStatus(RESULTS.UNAVAILABLE);
      return RESULTS.UNAVAILABLE;
    }
    const result = await PermissionsAndroid.request(LOCAL_NETWORK_PERMISSION);
    const status =
      result === PermissionsAndroid.RESULTS.GRANTED
        ? RESULTS.GRANTED
        : result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ? RESULTS.BLOCKED
          : RESULTS.DENIED;
    setLocalNetworkPermissionStatus(status);
    return status;
  }, []);

  return (
    <PermissionsContext.Provider
      value={{
        hasNotificationPermission,
        setHasNotificationPermission,
        notificationPermissionStatus,
        setNotificationPermissionStatus,
        microphonePermissionStatus,
        checkMicrophonePermission,
        requestMicrophonePermission,
        localNetworkPermissionStatus,
        checkLocalNetworkPermission,
        requestLocalNetworkPermission,
      }}>
      {children}
    </PermissionsContext.Provider>
  );
};
