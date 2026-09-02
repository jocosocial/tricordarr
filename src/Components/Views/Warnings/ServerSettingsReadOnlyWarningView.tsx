import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';

/**
 * Banner on the server settings form when the current account cannot edit them.
 */
export const ServerSettingsReadOnlyWarningView = () => {
  const {commonStyles} = useStyles();
  const {canEditSettings} = useAdminAccess();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerView: {
          ...commonStyles.twitarrNegative,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.paddingVerticalSmall,
        },
        headerText: {
          ...commonStyles.onTwitarrButton,
          ...commonStyles.bold,
        },
        subText: {
          ...commonStyles.onTwitarrButton,
        },
      }),
    [commonStyles],
  );

  if (canEditSettings) {
    return null;
  }

  return (
    <View style={styles.headerView}>
      <Text style={styles.headerText}>Read-Only Settings</Text>
      <Text variant={'bodyMedium'} style={styles.subText}>
        Only the admin account can change them.
      </Text>
    </View>
  );
};
