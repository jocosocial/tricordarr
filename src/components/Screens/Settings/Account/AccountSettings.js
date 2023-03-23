import React, {useEffect} from 'react';
import {LoginScreen} from './LoginScreen';
import {LogoutScreen} from './LogoutScreen';
import {useUserData} from '../../../Context/Contexts/UserDataContext';

export const AccountSettings = ({route, navigation}) => {
  const {isLoggedIn, isLoading} = useUserData();

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  if (!isLoading && isLoggedIn) {
    return <LogoutScreen />;
  } else if (!isLoading && !isLoggedIn){
    return <LoginScreen />;
  } else {
    return <></>;
  }
};
