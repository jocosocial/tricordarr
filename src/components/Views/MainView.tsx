import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from './AppView';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {useUserNotificationData} from "../Context/Contexts/UserNotificationDataContext";

export const MainView = () => {
  const {profilePublicData, tokenStringData} = useUserData();
  const {enableUserNotifications} = useUserNotificationData();
  return (
    <AppView>
      <Text variant={'titleLarge'}>Welcome to Boat!</Text>
      <Text>{JSON.stringify(profilePublicData)}</Text>
      <Text>{'\n'}</Text>
      <Text>{JSON.stringify(tokenStringData)}</Text>
    </AppView>
  );
};
