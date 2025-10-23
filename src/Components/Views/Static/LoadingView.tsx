import React from 'react';
import {RefreshControl, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface LoadingViewProps {
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const LoadingView = (props: LoadingViewProps) => {
  const {commonStyles} = useStyles();
  return (
    <AppView safeEdges={['bottom', 'top']}>
      <ScrollingContentView
        refreshControl={<RefreshControl refreshing={props.refreshing || false} onRefresh={props.onRefresh} />}>
        <ActivityIndicator />
        <View
          style={[
            commonStyles.flex,
            commonStyles.justifyCenter,
            commonStyles.alignItemsCenter,
            commonStyles.marginTop,
          ]}>
          <Text>Loading...</Text>
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
