import {createContext, useContext} from 'react';

import {DeviceConfig} from '#src/Libraries/AppConfig';

interface DeviceConfigContextType {
  deviceConfig: DeviceConfig;
  updateDeviceConfig: (c: DeviceConfig) => void;
}

/**
 * The device-wide slice of config. Components almost always want `useConfig()` (the effective,
 * merged view); this exists for the providers that sit above the session.
 */
export const DeviceConfigContext = createContext(<DeviceConfigContextType>{});

export const useDeviceConfig = () => useContext(DeviceConfigContext);
