import React, {PropsWithChildren, useEffect, useState} from 'react';
import {checkNotifications, PermissionStatus, RESULTS} from 'react-native-permissions';

import {PermissionsContext} from '#src/Context/Contexts/PermissionsContext';

export const PermissionsProvider = ({children}: PropsWithChildren) => {
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<PermissionStatus | undefined>();

  useEffect(() => {
    checkNotifications().then(({status}) => {
      setHasNotificationPermission(status === RESULTS.GRANTED);
      setNotificationPermissionStatus(status);
    });
  }, []);

  return (
    <PermissionsContext.Provider
      value={{
        hasNotificationPermission,
        setHasNotificationPermission,
        notificationPermissionStatus,
        setNotificationPermissionStatus,
      }}>
      {children}
    </PermissionsContext.Provider>
  );
};

