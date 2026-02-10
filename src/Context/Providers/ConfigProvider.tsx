import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {PropsWithChildren, useEffect, useState} from 'react';

import {ConfigContext} from '#src/Context/Contexts/ConfigContext';
import {AppConfig, defaultAppConfig, getAppConfig} from '#src/Libraries/AppConfig';
import {createLogger} from '#src/Libraries/Logger';
import {StorageKeys} from '#src/Libraries/Storage';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('ConfigProvider.tsx');

export const ConfigProvider = ({children}: PropsWithChildren) => {
  const [appConfig, setAppConfig] = useState<AppConfig>();
  const [isReady, setIsReady] = useState<boolean>(false);

  const loadAppConfig = async () => {
    logger.debug('loadAppConfig start');
    const config = await getAppConfig();
    setAppConfig(config);
    NativeTricordarrModule.setAppConfig(JSON.stringify(config));
    logger.debug('loadAppConfig finished');
  };

  useEffect(() => {
    logger.debug('useEffect calling loadAppConfig...');
    loadAppConfig()
      .then(() => {
        logger.debug('useEffect finished!');
        setIsReady(true);
      })
      .catch(error => {
        logger.error('Failed to load config, using defaults:', error);
        setAppConfig(defaultAppConfig);
        setIsReady(true);
      });
  }, []);

  const updateAppConfig = (newConfig: AppConfig) => {
    logger.info('Updating app config to', newConfig);
    // Update state immediately to avoid race conditions where consumers navigate
    // before the state is updated.
    setAppConfig(newConfig);
    NativeTricordarrModule.setAppConfig(JSON.stringify(newConfig));
    // Persist to storage in the background.
    AsyncStorage.setItem(StorageKeys.APP_CONFIG, JSON.stringify(newConfig));
    logger.debug('updateAppConfig finished');
  };

  // This should eventually show the splash screen.
  // https://github.com/jocosocial/tricordarr/issues/390
  if (!isReady) {
    logger.debug('Config is not ready.');
    return null;
  }

  if (!appConfig) {
    logger.error('App config is empty?');
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
