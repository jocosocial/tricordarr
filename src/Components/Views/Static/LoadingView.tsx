import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface LoadingViewProps {
  refreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * Loading spinner content. Renders no screen chrome -- the caller is responsible for
 * wrapping it in an <AppView>. Rendering an AppView here would double the app-wide
 * banners whenever this is used inside a screen that already has one.
 */
export const LoadingView = (props: LoadingViewProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    container: {
      ...commonStyles.flex,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.marginTop,
    },
  });

  return (
    <ScrollingContentView
      refreshControl={<AppRefreshControl refreshing={props.refreshing || false} onRefresh={props.onRefresh} />}>
      <ActivityIndicator />
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    </ScrollingContentView>
  );
};
