import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

export const MainView = () => {
  return (
    <View style={{backgroundColor: 'orange', flex: 1}}>
      <Text variant={'titleLarge'}>Welcome to Boat!</Text>
    </View>
  );
};
