import React, {useEffect, useState} from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export const AccountListItem = () => {
  const [title, setTitle] = useState('UNKNOWN');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const description = 'Manage your Twitarr account.';
  const {isLoggedIn, isLoading, profilePublicData} = useUserData();
  const {setErrorMessage} = useErrorHandler();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      if (!!profilePublicData.header && !!profilePublicData.header.username) {
        setTitle(profilePublicData.header.username);
      }
    } else {
      setTitle('Login');
    }
  }, [isLoggedIn, isLoading, setErrorMessage, profilePublicData]);

  return (
    <List.Item
      title={title}
      description={description}
      onPress={() => navigation.push('AccountSettingsScreen', {title: title})}
    />
  );
};
