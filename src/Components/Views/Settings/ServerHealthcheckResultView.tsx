import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useHealthQuery} from '#src/Queries/Client/ClientQueries';

interface ServerHealthcheckResultViewProps {
  serverHealthPassed: boolean;
}

export const ServerHealthcheckResultView = ({serverHealthPassed}: ServerHealthcheckResultViewProps) => {
  const {commonStyles} = useStyles();
  const {data: serverHealthData, dataUpdatedAt, errorUpdatedAt, isError, isSuccess} = useHealthQuery();
  const {theme} = useAppTheme();

  const styles = StyleSheet.create({
    viewContainer: {
      ...commonStyles.alignItemsCenter,
    },
  });

  // https://github.com/TanStack/query/discussions/1229
  const updatedAt = isError ? new Date(errorUpdatedAt) : isSuccess ? new Date(dataUpdatedAt) : undefined;

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
      {updatedAt && (
        <Text>
          Checked <RelativeTimeTag date={updatedAt} />
        </Text>
      )}
    </View>
  );
};
