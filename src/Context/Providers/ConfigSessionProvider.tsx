import React, {PropsWithChildren} from 'react';

import {ConfigProvider} from '#src/Context/Providers/ConfigProvider';
import {EffectiveConfigProvider} from '#src/Context/Providers/EffectiveConfigProvider';
import {SessionProvider} from '#src/Context/Providers/SessionProvider';

/**
 * Bundles the device config, the session state, and the effective (device + session) config that
 * `useConfig()` reads. The order matters: SessionProvider needs ConfigProvider, and
 * EffectiveConfigProvider needs both.
 */
export const ConfigSessionProvider = ({children}: PropsWithChildren) => {
  return (
    <ConfigProvider>
      <SessionProvider>
        <EffectiveConfigProvider>{children}</EffectiveConfigProvider>
      </SessionProvider>
    </ConfigProvider>
  );
};
