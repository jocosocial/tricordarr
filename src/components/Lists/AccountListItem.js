import React, {useEffect, useState} from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {AppSettings} from "../../libraries/AppSettings";

export const AccountListItem = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [title, setTitle] = useState('');
  const navigation = useNavigation();
  const description = 'Manage your Twitarr account.';

  useEffect(() => {
    async function determineLoginStatus() {
      const isUserLoggedIn = !!(await AppSettings.USERNAME.getValue()) && !!(await AppSettings.AUTH_TOKEN.getValue());
      console.log('Is user logged in?', isUserLoggedIn);
      setIsLoggedIn(isUserLoggedIn);
      setTitle(isUserLoggedIn ? await AppSettings.USERNAME.getValue() : 'Login');
    }
    determineLoginStatus();
  }, []);

  return (
    <List.Item
      title={title}
      description={description}
      onPress={() => navigation.push('AccountSettings', {title: title, isLoggedIn: isLoggedIn})}
    />
  );
};
