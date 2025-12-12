import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

export const PreRegistrationWarningView = () => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    headerView: {
      ...commonStyles.twitarrNeutral,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingVerticalSmall,
    },
    headerText: {
      ...commonStyles.bold,
      ...commonStyles.onTwitarrButton,
    },
  });

  return (
    <View style={styles.headerView}>
      <Text style={styles.headerText}>Pre-Registration Mode</Text>
      <Text variant={'labelSmall'} style={commonStyles.onTwitarrButton}>
        Tap here when you are physically on the ship.
      </Text>
    </View>
  );
};
