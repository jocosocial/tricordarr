import React from 'react';
import {ScrollView} from 'react-native';
import {Text} from 'react-native-paper';
import {AppView} from './AppView';
import {AppContainerView} from './AppContainerView';

export const NotLoggedInView = () => {
  return (
    <AppView>
      <AppContainerView>
        <ScrollView>
          <Text>You are not logged in</Text>
        </ScrollView>
      </AppContainerView>
    </AppView>
  );
};
