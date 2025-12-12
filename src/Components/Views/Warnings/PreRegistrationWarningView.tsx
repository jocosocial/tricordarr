import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {OobeStackComponents} from '#src/Navigation/Stacks/OobeStackNavigator';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/RootStackNavigator';

export const PreRegistrationWarningView = () => {
  const {commonStyles} = useStyles();
  const navigation = useRootStack();
  const {appConfig} = useConfig();

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

  const onPress = () => {
    navigation.push(RootStackComponents.oobeNavigator, {
      screen: OobeStackComponents.oobePreregistrationScreen,
    });
  };

  return (
    <TouchableOpacity disabled={!appConfig.oobeCompleted} style={styles.headerView} onPress={onPress}>
      <Text style={styles.headerText}>Pre-Registration Mode</Text>
      {appConfig.oobeCompleted ? (
        <Text variant={'labelSmall'} style={commonStyles.onTwitarrButton}>
          Tap here when you are physically on the ship.
        </Text>
      ) : (
        <Text variant={'labelSmall'} style={commonStyles.onTwitarrButton}>
          Complete setup to start using Twitarr.
        </Text>
      )}
    </TouchableOpacity>
  );
};
