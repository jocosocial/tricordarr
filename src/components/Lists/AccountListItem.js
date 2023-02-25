import React, {useEffect, useState} from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {AppSettings} from '../../libraries/AppSettings';
import {useUserContext} from '../Contexts/UserContext';
import {useUserData} from '../Contexts/UserDataContext';

export const AccountListItem = () => {
  const [title, setTitle] = useState('');
  const navigation = useNavigation();
  const description = 'Manage your Twitarr account.';
  // const {isUserLoggedIn} = useUserContext();
  const {tokenStringData} = useUserData();

  useEffect(() => {
    async function determineLoginStatus() {
      const uname = await AppSettings.USERNAME.getValue();
      console.log('The settings things you are', uname);
      setTitle(uname ? uname : 'Login');
    }
    determineLoginStatus();
  }, [tokenStringData]);

  return (
    <List.Item
      title={title}
      description={description}
      onPress={() => navigation.push('AccountSettingsScreen', {title: title})}
    />
  );
};
