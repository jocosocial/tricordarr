import {createContext, useContext} from 'react';
import {AppConfig} from '../../../libraries/AppConfig';

interface ConfigContextType {
  appConfig: AppConfig;
  updateAppConfig: (c: AppConfig) => void;
  oobeCompleted: boolean;
}

export const ConfigContext = createContext(<ConfigContextType>{});

export const useConfig = () => useContext(ConfigContext);
