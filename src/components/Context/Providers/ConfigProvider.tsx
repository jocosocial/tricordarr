import React, {useEffect, useState} from 'react';
import {PropsWithChildren} from 'react';
import {ConfigContext} from '../Contexts/ConfigContext';
import {AppConfig, getAppConfig} from '../../../libraries/AppConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../../../libraries/Storage';

export const ConfigProvider = ({children}: PropsWithChildren) => {
  const [appConfig, setAppConfig] = useState<AppConfig>();

  useEffect(() => {
    const loadConfig = async () => {
      return getAppConfig();
    };
    loadConfig()
      .then(config => setAppConfig(config))
      .finally(() => console.log('[ConfigProvider.tsx] Finished loading app config.'));
  }, []);

  const updateAppConfig = (newConfig: AppConfig) => {
    console.info('[ConfigProvider.tsx] Updating app config to', newConfig);
    AsyncStorage.setItem(StorageKeys.APP_CONFIG, JSON.stringify(newConfig)).then(() => setAppConfig(newConfig));
  };

  if (!appConfig) {
    return <></>;
  }

  const oobeCompleted = appConfig.oobeCompletedVersion === appConfig.oobeExpectedVersion;

  return (
    <ConfigContext.Provider value={{appConfig, updateAppConfig, oobeCompleted}}>{children}</ConfigContext.Provider>
  );
};
