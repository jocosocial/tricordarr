import {Text} from 'react-native-paper';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {CommonStackComponents, useCommonStack} from '../Navigation/CommonScreens';

export const ConnectionDisruptedView = () => {
  const {commonStyles} = useStyles();
  const commonNavigation = useCommonStack();

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
    commonNavigation.push(CommonStackComponents.configServerUrl);
  };

  return (
    <TouchableOpacity style={styles.headerView} onPress={onPress}>
      <Text style={styles.headerText}>Connection Disrupted</Text>
      <Text variant={'labelSmall'} style={commonStyles.errorContainer}>Tap here for more information</Text>
    </TouchableOpacity>
  );
};
