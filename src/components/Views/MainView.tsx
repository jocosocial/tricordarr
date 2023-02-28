import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from './AppView';
import {useUserData} from '../Context/Contexts/UserDataContext';

export const MainView = () => {
  const {profilePublicData} = useUserData();
  return (
    <AppView>
      <Text variant={'titleLarge'}>Welcome to Boat!</Text>
      <Text>{JSON.stringify(profilePublicData)}</Text>
    </AppView>
  );
};
