import React, {useEffect, useState} from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {AppSettings} from "../../libraries/AppSettings";

export const AccountListItem = () => {
  const [title, setTitle] = useState('Login');
  const navigation = useNavigation();
  const description = 'Manage your Twitarr account.';

  useEffect(() => {
    async function getCurrentUser() {
      setTitle((await AppSettings.USERNAME.getValue()) || 'Login');
    }
    getCurrentUser().catch(console.error);
  }, []);

  return (
    <List.Item
      title={title}
      description={description}
      onPress={() => navigation.push('AccountSettings', {title: title})}
    />
  );
};
