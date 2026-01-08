import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {PropsWithChildren, useEffect, useState} from 'react';

import {ConfigContext} from '#src/Context/Contexts/ConfigContext';
import {AppConfig, defaultAppConfig, getAppConfig} from '#src/Libraries/AppConfig';
import {StorageKeys} from '#src/Libraries/Storage';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

export const ConfigProvider = ({children}: PropsWithChildren) => {
  const [appConfig, setAppConfig] = useState<AppConfig>();
  const [isReady, setIsReady] = useState<boolean>(false);

  const loadAppConfig = async () => {
    console.log('[ConfigProvider.tsx] loadAppConfig start');
    const config = await getAppConfig();
    setAppConfig(config);
    NativeTricordarrModule.setAppConfig(JSON.stringify(config));
    console.log('[ConfigProvider.tsx] loadAppConfig finished');
  };

  useEffect(() => {
    console.log('[ConfigProvider.tsx] useEffect calling loadAppConfig...');
    loadAppConfig()
      .then(() => {
        console.log('[ConfigProvider.tsx] useEffect finished!');
        setIsReady(true);
      })
      .catch(error => {
        console.error('[ConfigProvider.tsx] Failed to load config, using defaults:', error);
        setAppConfig(defaultAppConfig);
        setIsReady(true);
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
    console.log('[ConfigProvider.tsx] updateAppConfig finished');
  };

  // This should eventually show the splash screen.
  // https://github.com/jocosocial/tricordarr/issues/390
  if (!isReady) {
    console.log('[ConfigProvider.tsx] Config is not ready.');
    return null;
  }

  if (!appConfig) {
    console.error('[ConfigProvider.tsx] App config is empty?');
    return null;
  }

  return (
    <ConfigContext.Provider
      value={{
        appConfig,
        updateAppConfig,
      }}>
      {children}
    </ConfigContext.Provider>
  );
};
