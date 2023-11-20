import React from 'react';
import {View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {ScrollingContentView} from '../Content/ScrollingContentView';

export const LoadingView = () => {
  return (
    <View>
      <ScrollingContentView>
        <ActivityIndicator />
        <Text>Loading...</Text>
      </ScrollingContentView>
    </View>
  );
};
