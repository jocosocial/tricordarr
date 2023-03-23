import React from 'react';
import {ScrollView} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {ScrollingContentView} from '../Content/ScrollingContentView';

export const LoadingView = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <ScrollView>
          <ActivityIndicator />
          <Text>Loading...</Text>
        </ScrollView>
      </ScrollingContentView>
    </AppView>
  );
};
