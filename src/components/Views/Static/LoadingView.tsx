import React from 'react';
import {RefreshControl, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {AppView} from '../AppView';

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
