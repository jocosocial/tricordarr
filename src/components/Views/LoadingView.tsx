import React from 'react';
import {ScrollView} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {AppView} from './AppView';
import {AppContainerView} from './AppContainerView';

export const LoadingView = () => {
  return (
    <AppView>
      <AppContainerView>
        <ScrollView>
          <ActivityIndicator />
          <Text>Loading...</Text>
        </ScrollView>
      </AppContainerView>
    </AppView>
  );
};
