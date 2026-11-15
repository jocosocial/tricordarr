import React, {PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';

import {DeviceConfigContext} from '#src/Context/Contexts/DeviceConfigContext';
import {defaultDeviceConfig, DeviceConfig, getDeviceConfig, saveDeviceConfig} from '#src/Libraries/AppConfig';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('ConfigProvider.tsx');

/**
 * Loads and persists the device-wide config (APP_CONFIG_V3). The effective config that
 * `useConfig()` returns is assembled below the SessionProvider by EffectiveConfigProvider, which
 * is also what mirrors it to the native modules.
 */
export const ConfigProvider = ({children}: PropsWithChildren) => {
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig>();
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    logger.debug('Loading device config...');
    getDeviceConfig()
      .then(config => setDeviceConfig(config))
      .catch(error => {
        logger.error('Failed to load config, using defaults:', error);
        setDeviceConfig(defaultDeviceConfig);
      })
      .finally(() => setIsReady(true));
  }, []);

  const updateDeviceConfig = useCallback((newConfig: DeviceConfig) => {
    logger.info('Updating device config to', newConfig);
    // Update state immediately to avoid race conditions where consumers navigate
    // before the state is updated.
    setDeviceConfig(newConfig);
    // Persist to storage in the background.
    saveDeviceConfig(newConfig).catch(error => logger.error('Failed to save device config:', error));
  }, []);

  const value = useMemo(
    () => (deviceConfig ? {deviceConfig, updateDeviceConfig} : undefined),
    [deviceConfig, updateDeviceConfig],
  );

  // This should eventually show the splash screen.
  // https://github.com/jocosocial/tricordarr/issues/390
  if (!isReady) {
    logger.debug('Config is not ready.');
    return null;
  }

  if (!value) {
    logger.error('Device config is empty?');
    return null;
  }

  return <DeviceConfigContext.Provider value={value}>{children}</DeviceConfigContext.Provider>;
};
