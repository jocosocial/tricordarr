import {Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

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
        Restart the wizard or the app to leave this mode
      </Text>
    </View>
  );
};
