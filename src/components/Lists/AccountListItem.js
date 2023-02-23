import React, {useContext, useEffect, useState} from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {AppSettings} from "../../libraries/AppSettings";
import {UserContext} from '../../../App';

export const AccountListItem = () => {
  const [title, setTitle] = useState('');
  const navigation = useNavigation();
  const description = 'Manage your Twitarr account.';
  const {isUserLoggedIn, setIsUserLoggedIn} = useContext(UserContext);

  useEffect(() => {
    async function determineLoginStatus() {
      setTitle(isUserLoggedIn ? await AppSettings.USERNAME.getValue() : 'Login');
    }
    determineLoginStatus();
  }, [isUserLoggedIn]);

  return (
    <List.Item
      title={title}
      description={description}
      onPress={() => navigation.push('AccountSettings', {title: title})}
    />
  );
};
