import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {PropsWithChildren, useEffect, useState} from 'react';
import {checkNotifications, PermissionStatus, RESULTS} from 'react-native-permissions';

import {ConfigContext} from '#src/Context/Contexts/ConfigContext';
import {AppConfig, getAppConfig} from '#src/Libraries/AppConfig';
import {StorageKeys} from '#src/Libraries/Storage';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

export const ConfigProvider = ({children}: PropsWithChildren) => {
  const [appConfig, setAppConfig] = useState<AppConfig>();
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<PermissionStatus | undefined>();

  useEffect(() => {
    const loadConfig = async () => {
      return getAppConfig();
    };
    loadConfig()
      .then(config => {
        setAppConfig(config);
        NativeTricordarrModule.setAppConfig(JSON.stringify(config));
      })
      .finally(() => console.log('[ConfigProvider.tsx] Finished loading app config.'));
    checkNotifications().then(({status}) => {
      setHasNotificationPermission(status === RESULTS.GRANTED);
      setNotificationPermissionStatus(status);
    });
  }, []);

  const updateAppConfig = (newConfig: AppConfig) => {
    console.info('[ConfigProvider.tsx] Updating app config to', newConfig);
    // Update state immediately to avoid race conditions where consumers navigate
    // before the state is updated.
    setAppConfig(newConfig);
    NativeTricordarrModule.setAppConfig(JSON.stringify(newConfig));
    // Persist to storage in the background.
    AsyncStorage.setItem(StorageKeys.APP_CONFIG, JSON.stringify(newConfig));
  };

  if (!appConfig) {
    console.warn('[ConfigProvider.tsx] App config is empty?');
    return <></>;
  }

  const oobeCompleted = appConfig.oobeCompletedVersion === appConfig.oobeExpectedVersion;

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
      }}>
      {children}
    </ConfigContext.Provider>
  );
};
