import React, {useEffect, useState} from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {AppSettings} from '../../libraries/AppSettings';
import {useUserData} from '../Contexts/UserDataContext';

export const AccountListItem = () => {
  const [title, setTitle] = useState('');
  const navigation = useNavigation();
  const description = 'Manage your Twitarr account.';
  const {isLoggedIn} = useUserData();

  useEffect(() => {
    async function determineLoginStatus() {
      const userID = await AppSettings.USER_ID.getValue();
      console.log('The settings things you are', userID);
      setTitle(isLoggedIn ? userID : 'Login');
    }
    determineLoginStatus();
  }, [isLoggedIn]);

  return (
    <List.Item
      title={title}
      description={description}
      onPress={() => navigation.push('AccountSettingsScreen', {title: title})}
    />
  );
};
