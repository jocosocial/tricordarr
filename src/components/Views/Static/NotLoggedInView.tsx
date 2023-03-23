import React from 'react';
import {ScrollView} from 'react-native';
import {Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {ScrollingContentView} from '../Content/ScrollingContentView';

export const NotLoggedInView = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <ScrollView>
          <Text>You are not logged in</Text>
        </ScrollView>
      </ScrollingContentView>
    </AppView>
  );
};
