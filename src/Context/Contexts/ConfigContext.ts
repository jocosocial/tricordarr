import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {PermissionStatus} from 'react-native-permissions';

import {AppConfig} from '#src/Libraries/AppConfig';

interface ConfigContextType {
  appConfig: AppConfig;
  updateAppConfig: (c: AppConfig) => void;
  oobeCompleted: boolean;
  hasNotificationPermission: boolean;
  setHasNotificationPermission: Dispatch<SetStateAction<boolean>>;
  notificationPermissionStatus: PermissionStatus | undefined;
  setNotificationPermissionStatus: Dispatch<SetStateAction<PermissionStatus | undefined>>;
}

export const ConfigContext = createContext(<ConfigContextType>{});

export const useConfig = () => useContext(ConfigContext);
