import React, {useEffect, useState} from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useUserData} from '../Context/Contexts/UserDataContext';

export const AccountListItem = () => {
  const [title, setTitle] = useState('');
  const navigation = useNavigation();
  const description = 'Manage your Twitarr account.';
  const {isLoggedIn, profilePublicData} = useUserData();

  useEffect(() => {
    async function determineTitle() {
      if (isLoggedIn && profilePublicData.header && profilePublicData.header.username) {
        setTitle(profilePublicData.header.username);
      } else {
        setTitle('Login');
      }
    }
    determineTitle();
  }, [isLoggedIn, profilePublicData.header]);

  return (
    <List.Item
      title={title}
      description={description}
      onPress={() => navigation.push('AccountSettingsScreen', {title: title})}
    />
  );
};
