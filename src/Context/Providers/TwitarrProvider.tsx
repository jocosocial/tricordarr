import {PropsWithChildren} from 'react';

import {CallProvider} from '#src/Context/Providers/CallProvider';
import {ClientSettingsProvider} from '#src/Context/Providers/ClientSettingsProvider';
import {CruiseProvider} from '#src/Context/Providers/CruiseProvider';
import {FeatureProvider} from '#src/Context/Providers/FeatureProvider';
import {LinkingProvider} from '#src/Context/Providers/LinkingProvider';
import {PrivilegeProvider} from '#src/Context/Providers/PrivilegeProvider';
import {RoleProvider} from '#src/Context/Providers/RoleProvider';
import {SocketProvider} from '#src/Context/Providers/SocketProvider';
import {TimeProvider} from '#src/Context/Providers/TimeProvider';
import {TimeZoneChangesProvider} from '#src/Context/Providers/TimeZoneChangesProvider';

/**
 * Groups Twitarr/app-feature providers (privileges, roles, socket, linking,
 * features, client settings, cruise, timezone) in one place.
 */
export const TwitarrProvider = ({children}: PropsWithChildren) => {
  return (
    <PrivilegeProvider>
      <RoleProvider>
        <SocketProvider>
          <LinkingProvider>
            <FeatureProvider>
              <ClientSettingsProvider>
                <CallProvider>
                  <TimeProvider>
                    <CruiseProvider>
                      <TimeZoneChangesProvider>{children}</TimeZoneChangesProvider>
                    </CruiseProvider>
                  </TimeProvider>
                </CallProvider>
              </ClientSettingsProvider>
            </FeatureProvider>
          </LinkingProvider>
        </SocketProvider>
      </RoleProvider>
    </PrivilegeProvider>
  );
};
