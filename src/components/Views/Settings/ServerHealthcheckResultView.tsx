import {HealthResponse} from '../../../libraries/Structs/ControllerStructs.tsx';
import {Text} from 'react-native-paper';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {AppIcon} from '../../Icons/AppIcon.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {useAppTheme} from '../../../styles/Theme.ts';

interface ServerHealthcheckResultViewProps {
  serverHealthPassed: boolean;
  serverHealthData?: HealthResponse;
}

export const ServerHealthcheckResultView = ({
  serverHealthPassed,
  serverHealthData,
}: ServerHealthcheckResultViewProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    viewContainer: {
      ...commonStyles.alignItemsCenter,
    },
  });
  return (
    <View style={styles.viewContainer}>
      {serverHealthPassed ? (
        <AppIcon icon={AppIcons.passed} size={100} color={theme.colors.twitarrPositiveButton} />
      ) : (
        <AppIcon icon={AppIcons.error} size={100} color={theme.colors.twitarrNegativeButton} />
      )}
      {serverHealthPassed && <Text>Server check passed!</Text>}
      {!serverHealthPassed && serverHealthData?.error && (
        <Text>
          The Twitarr server is down. Try again later. Error: {serverHealthData.reason} ({serverHealthData.status})
        </Text>
      )}
      {!serverHealthPassed && (
        <Text>
          Server check failed. Ensure your phone is on ship wifi, all VPNs and DNS interceptors are disabled, and the
          server URL is correct. If the issue persists go to the JoCo Cruise Info Desk for assistance.
        </Text>
      )}
    </View>
  );
};
