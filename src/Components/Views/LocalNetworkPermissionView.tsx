import React from 'react';
import {Text} from 'react-native-paper';
import {RESULTS} from 'react-native-permissions';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {usePermissions} from '#src/Context/Contexts/PermissionsContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface LocalNetworkPermissionViewProps {
  /** Called once the user grants the permission, e.g. to retry a failed healthcheck. */
  onGranted?: () => void;
}

/**
 * Asks for the Android local network permission that is needed to reach the ship server. Renders
 * nothing where the platform doesn't require it.
 */
export const LocalNetworkPermissionView = ({onGranted}: LocalNetworkPermissionViewProps) => {
  const {commonStyles} = useStyles();
  const {localNetworkPermissionStatus, requestLocalNetworkPermission} = usePermissions();

  if (!localNetworkPermissionStatus || localNetworkPermissionStatus === RESULTS.UNAVAILABLE) {
    return null;
  }

  const onPress = async () => {
    const status = await requestLocalNetworkPermission();
    if (status === RESULTS.GRANTED) {
      onGranted?.();
    }
  };

  return (
    <PaddedContentView padTop={true}>
      <Text style={commonStyles.marginBottomSmall}>
        The production server is on the ship's local network. Newer Android versions require your permission before this
        app can talk to it. Without this the server check below will fail.
      </Text>
      {localNetworkPermissionStatus === RESULTS.BLOCKED ? (
        <Text>
          Local network access has been blocked by your device. You'll need to enable it for this app manually in your
          device settings.
        </Text>
      ) : (
        <PrimaryActionButton
          testID={'oobeAllowLocalNetwork-button'}
          buttonText={localNetworkPermissionStatus === RESULTS.GRANTED ? 'Already Allowed' : 'Allow Local Network'}
          onPress={onPress}
          disabled={localNetworkPermissionStatus === RESULTS.GRANTED}
        />
      )}
    </PaddedContentView>
  );
};
