import React, {PropsWithChildren, useCallback, useEffect, useMemo} from 'react';

import {ConfigContext} from '#src/Context/Contexts/ConfigContext';
import {useDeviceConfig} from '#src/Context/Contexts/DeviceConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppConfig, mergeAppConfig, splitAppConfig} from '#src/Libraries/AppConfig';
import {createLogger} from '#src/Libraries/Logger';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('EffectiveConfigProvider.tsx');

/**
 * Provides the effective config: device config, merged with the active account's preferences and
 * the active server's profile. `useConfig()` consumers keep reading and writing one AppConfig;
 * `updateAppConfig` splits a write back to where each field lives (device, account, server).
 * The merged view is also what the native modules get via `setAppConfig`, so it is re-mirrored
 * whenever any of the three parts change, including on an account switch.
 *
 * With no account signed in, preferences are the device defaults and edits to them become the
 * defaults new accounts start from.
 */
export const EffectiveConfigProvider = ({children}: PropsWithChildren) => {
  const {deviceConfig, updateDeviceConfig} = useDeviceConfig();
  const {
    currentSession,
    currentAccount,
    accountPreferences,
    serverProfile,
    updateAccountPreferences,
    updateServerProfile,
  } = useSession();

  const preferences = accountPreferences ?? deviceConfig.defaultPreferences;

  const appConfig = useMemo(
    () => mergeAppConfig(deviceConfig, preferences, serverProfile),
    [deviceConfig, preferences, serverProfile],
  );

  useEffect(() => {
    NativeTricordarrModule.setAppConfig(JSON.stringify(appConfig));
  }, [appConfig]);

  /**
   * Accepts a full effective config, as before the split, and writes each part to its own home.
   * Parts that did not change are not written.
   */
  const updateAppConfig = useCallback(
    (newConfig: AppConfig) => {
      logger.info('Updating app config to', newConfig);
      const {device, preferences: newPrefs, server} = splitAppConfig(newConfig);
      const prefsChanged = JSON.stringify(newPrefs) !== JSON.stringify(preferences);
      const serverChanged = JSON.stringify(server) !== JSON.stringify(appConfigServerFields(appConfig));
      const deviceChanged =
        JSON.stringify({...device, defaultPreferences: null}) !==
        JSON.stringify({...deviceConfig, defaultPreferences: null});

      if (currentAccount && prefsChanged) {
        updateAccountPreferences(currentAccount.accountID, newPrefs).catch(error =>
          logger.error('Failed to update account preferences:', error),
        );
      }
      if (currentSession && serverChanged) {
        updateServerProfile(currentSession.serverUrl, server).catch(error =>
          logger.error('Failed to update server profile:', error),
        );
      }
      if (deviceChanged || (!currentAccount && prefsChanged)) {
        updateDeviceConfig({
          ...device,
          defaultPreferences: !currentAccount && prefsChanged ? newPrefs : deviceConfig.defaultPreferences,
        });
      }
    },
    [
      appConfig,
      currentAccount,
      currentSession,
      deviceConfig,
      preferences,
      updateAccountPreferences,
      updateDeviceConfig,
      updateServerProfile,
    ],
  );

  const value = useMemo(() => ({appConfig, updateAppConfig}), [appConfig, updateAppConfig]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

/**
 * The server-profile fields of an effective config, for change detection.
 */
const appConfigServerFields = (config: AppConfig) => splitAppConfig(config).server;
