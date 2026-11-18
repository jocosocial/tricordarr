import React from 'react';
import {RESULTS} from 'react-native-permissions';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {usePermissions} from '#src/Context/Contexts/PermissionsContext';

interface LocalNetworkPermissionWarningViewProps {
  /** Whether the banner may show at all, e.g. only when connecting to the on-ship server. */
  visible?: boolean;
}

/**
 * Banner shown when the local network permission is needed to reach the ship server but has not
 * been granted. Renders nothing where the platform doesn't require the permission.
 */
export const LocalNetworkPermissionWarningView = ({visible = true}: LocalNetworkPermissionWarningViewProps) => {
  const {localNetworkPermissionStatus} = usePermissions();

  const permissionNeeded =
    !!localNetworkPermissionStatus &&
    localNetworkPermissionStatus !== RESULTS.UNAVAILABLE &&
    localNetworkPermissionStatus !== RESULTS.GRANTED;

  return (
    <BaseWarningView
      variant={'negative'}
      title={'Local Network Permission'}
      message={
        // "The server is on the ship's local network which your device requires explicit permission to connect to."
        'Connections to local servers (such as the on-board Twitarr server) may require explicit permission to function.'
      }
      visible={visible && permissionNeeded}
    />
  );
};
