import {Text} from 'react-native-paper';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {RootStackComponents, useRootStack} from '../Navigation/Stacks/RootStackNavigator';
import {
  BottomTabComponents,
  MainStackComponents,
  SettingsStackScreenComponents,
} from '../../libraries/Enums/Navigation';

export const ConnectionDisruptedView = () => {
  const {commonStyles} = useStyles();
  const rootNavigation = useRootStack();

  const styles = StyleSheet.create({
    headerView: {
      ...commonStyles.errorContainer,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingVerticalSmall,
    },
    headerText: {
      ...commonStyles.bold,
      ...commonStyles.errorContainer,
    },
  });

  const onPress = () => {
    rootNavigation.navigate(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.mainSettingsScreen,
        params: {
          screen: SettingsStackScreenComponents.configServerUrl,
        },
        initial: false,
      },
    });
  };

  return (
    <TouchableOpacity style={styles.headerView} onPress={onPress}>
      <Text style={styles.headerText}>Connection Disrupted</Text>
      <Text variant={'labelSmall'} style={commonStyles.errorContainer}>Tap here for more information</Text>
    </TouchableOpacity>
  );
};
