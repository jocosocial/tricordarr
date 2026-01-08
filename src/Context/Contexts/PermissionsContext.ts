import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {PermissionStatus} from 'react-native-permissions';

interface PermissionsContextType {
  hasNotificationPermission: boolean;
  setHasNotificationPermission: Dispatch<SetStateAction<boolean>>;
  notificationPermissionStatus: PermissionStatus | undefined;
  setNotificationPermissionStatus: Dispatch<SetStateAction<PermissionStatus | undefined>>;
}

export const PermissionsContext = createContext(<PermissionsContextType>{});

export const usePermissions = () => useContext(PermissionsContext);
