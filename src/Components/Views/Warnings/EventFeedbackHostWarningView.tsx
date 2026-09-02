import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

/**
 * Banner on the host feedback form: this is for shadow hosts, not attendees.
 */
export const EventFeedbackHostWarningView = () => {
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerView: {
          ...commonStyles.twitarrNegative,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.paddingVerticalSmall,
          ...commonStyles.paddingHorizontal,
        },
        headerText: {
          ...commonStyles.onTwitarrButton,
          ...commonStyles.bold,
          ...commonStyles.textCenter,
          ...commonStyles.fullWidth,
        },
        subText: {
          ...commonStyles.onTwitarrButton,
          ...commonStyles.textCenter,
          ...commonStyles.fullWidth,
        },
      }),
    [commonStyles],
  );

  return (
    <View style={styles.headerView}>
      <Text style={styles.headerText}>For Event Hosts Only</Text>
      <Text variant={'bodyMedium'} style={styles.subText}>
        Please don't use this to give feedback about events you attended. Save that for the post-cruise survey.
      </Text>
    </View>
  );
};
