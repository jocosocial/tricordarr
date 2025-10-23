import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonStackComponents, useCommonRoute, useCommonStack} from '#src/Navigation/CommonScreens';

export const ConnectionDisruptedView = () => {
  const {commonStyles} = useStyles();
  const commonNavigation = useCommonStack();
  const commonRoute = useCommonRoute();

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
    <TouchableOpacity
      style={styles.headerView}
      onPress={onPress}
      disabled={commonRoute.name === CommonStackComponents.configServerUrl}
    >
      <Text style={styles.headerText}>Connection Disrupted</Text>
      <Text variant={'labelSmall'} style={commonStyles.errorContainer}>
        Tap here for more information
      </Text>
    </TouchableOpacity>
  );
};
