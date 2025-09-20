import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {AppConfig} from '#src/Libraries/AppConfig';
import {PermissionStatus} from 'react-native-permissions';

interface ConfigContextType {
  appConfig: AppConfig;
  updateAppConfig: (c: AppConfig) => void;
  oobeCompleted: boolean;
  hasNotificationPermission: boolean;
  setHasNotificationPermission: Dispatch<SetStateAction<boolean>>;
  notificationPermissionStatus: PermissionStatus | undefined;
  setNotificationPermissionStatus: Dispatch<SetStateAction<PermissionStatus | undefined>>;
  preRegistrationAvailable: boolean;
  preRegistrationMode: boolean;
  setPreRegistrationMode: Dispatch<SetStateAction<boolean>>;
}

export const ConfigContext = createContext(<ConfigContextType>{});

export const useConfig = () => useContext(ConfigContext);
