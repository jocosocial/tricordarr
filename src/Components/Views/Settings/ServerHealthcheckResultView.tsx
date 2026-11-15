import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useServerHealthStatus} from '#src/Hooks/useServerHealthStatus';

const RESULT_ICON_SIZE = 100;

/**
 * Shows the outcome of the current server healthcheck, or that one is in progress.
 */
export const ServerHealthcheckResultView = () => {
  const {commonStyles} = useStyles();
  const {healthQuery, checking, passed} = useServerHealthStatus();
  const {data: serverHealthData, dataUpdatedAt, errorUpdatedAt, isError, isSuccess} = healthQuery;
  const {theme} = useAppTheme();

  const styles = StyleSheet.create({
    viewContainer: {
      ...commonStyles.alignItemsCenter,
    },
  });

  // Never show a previous result while a check is running; it may be for another server.
  if (checking) {
    return (
      <View style={styles.viewContainer}>
        <AppIcon icon={AppIcons.checking} size={RESULT_ICON_SIZE} />
        <Text>Checking server...</Text>
      </View>
    );
  }

  // https://github.com/TanStack/query/discussions/1229
  const updatedAt = isError ? new Date(errorUpdatedAt) : isSuccess ? new Date(dataUpdatedAt) : undefined;

  return (
    <View style={styles.viewContainer}>
      {passed ? (
        <AppIcon icon={AppIcons.passed} size={RESULT_ICON_SIZE} color={theme.colors.twitarrPositiveButton} />
      ) : (
        <AppIcon icon={AppIcons.error} size={RESULT_ICON_SIZE} color={theme.colors.twitarrNegativeButton} />
      )}
      {passed && <Text>Server check passed!</Text>}
      {!passed && serverHealthData?.error && (
        <Text style={commonStyles.textCenter}>
          The Twitarr server is down. Try again later. Error: {serverHealthData.reason} ({serverHealthData.status})
        </Text>
      )}
      {!passed && (
        <Text style={commonStyles.textCenter}>
          Server check failed. Press the Help button for troubleshooting steps. If the issue persists, go to the Twitarr
          or JoCo Cruise Info Desk for assistance.
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
