import React, {PropsWithChildren, useCallback, useEffect, useState} from 'react';
import {
  checkNotifications,
  check as checkPermission,
  PERMISSIONS,
  PermissionStatus,
  request as requestPermission,
  RESULTS,
} from 'react-native-permissions';

import {PermissionsContext} from '#src/Context/Contexts/PermissionsContext';
import {isIOS} from '#src/Libraries/Platform/Detection';

const microphonePermission = isIOS ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;

export const PermissionsProvider = ({children}: PropsWithChildren) => {
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<PermissionStatus | undefined>();
  const [microphonePermissionStatus, setMicrophonePermissionStatus] = useState<PermissionStatus | undefined>();

  useEffect(() => {
    checkNotifications().then(({status}) => {
      setHasNotificationPermission(status === RESULTS.GRANTED);
      setNotificationPermissionStatus(status);
    });
  }, []);

  const checkMicrophonePermission = useCallback(async () => {
    const status = await checkPermission(microphonePermission);
    setMicrophonePermissionStatus(status);
  }, []);

  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);

  const requestMicrophonePermission = useCallback(async () => {
    const status = await requestPermission(microphonePermission);
    setMicrophonePermissionStatus(status);
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
      }}>
      {children}
    </PermissionsContext.Provider>
  );
};
