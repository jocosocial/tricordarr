import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useStyles} from '#src/Context/Contexts/StyleContext';

/**
 * App-level loading screen that does not depend on AppView.
 * Used by LoadingProvider during initial app restoration.
 */
export const AppLoadingScreen = () => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    safeArea: {
      ...commonStyles.flex,
      ...commonStyles.background,
    },
    container: {
      ...commonStyles.flex,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ActivityIndicator size={'large'} />
        <Text>Loading...</Text>
      </View>
    </SafeAreaView>
  );
};
