import React, {useEffect, useState} from 'react';
import {PropsWithChildren} from 'react';
import {ConfigContext} from '../Contexts/ConfigContext';
import {AppConfig, getAppConfig} from '../../../libraries/AppConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../../../libraries/Storage';
import {check as checkPermission, PERMISSIONS, PermissionStatus, RESULTS} from 'react-native-permissions';

export const ConfigProvider = ({children}: PropsWithChildren) => {
  const [appConfig, setAppConfig] = useState<AppConfig>();
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<PermissionStatus | undefined>();
  const [preRegistrationMode, setPreRegistrationMode] = useState<boolean>(false);

  useEffect(() => {
    const loadConfig = async () => {
      return getAppConfig();
    };
    loadConfig()
      .then(config => setAppConfig(config))
      .finally(() => console.log('[ConfigProvider.tsx] Finished loading app config.'));
    checkPermission(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(status => {
      setHasNotificationPermission(status === RESULTS.GRANTED);
      setNotificationPermissionStatus(status);
    });
  }, []);

  const updateAppConfig = (newConfig: AppConfig) => {
    console.info('[ConfigProvider.tsx] Updating app config to', newConfig);
    AsyncStorage.setItem(StorageKeys.APP_CONFIG, JSON.stringify(newConfig)).then(() => setAppConfig(newConfig));
  };

  if (!appConfig) {
    return <></>;
  }

  const oobeCompleted = appConfig.oobeCompletedVersion === appConfig.oobeExpectedVersion;
  const preRegistrationAvailable = new Date() <= appConfig.preRegistrationEndDate;
  console.log(appConfig.preRegistrationEndDate);

  return (
    <ConfigContext.Provider
      value={{
        appConfig,
        updateAppConfig,
        oobeCompleted,
        hasNotificationPermission,
        setHasNotificationPermission,
        notificationPermissionStatus,
        setNotificationPermissionStatus,
        preRegistrationAvailable,
        preRegistrationMode,
        setPreRegistrationMode,
      }}>
      {children}
    </ConfigContext.Provider>
  );
};
