import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useStyles} from '#src/Context/Contexts/StyleContext';

/**
 * App-level loading screen that does not depend on AppView.
 * Used by LoadingProvider during initial app restoration.
 */
export const AppLoadingScreen = () => {
  const {commonStyles} = useStyles();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      ...commonStyles.flex,
      ...commonStyles.background,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator size={'large'} />
      <Text>Loading...</Text>
    </View>
  );
};
