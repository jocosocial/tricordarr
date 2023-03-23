import React, {useEffect} from 'react';
import {LoginScreen} from './LoginScreen';
import {LogoutScreen} from './LogoutScreen';
import {useUserData} from '../../../Context/Contexts/UserDataContext';

interface AccountSettingsProps {
  route: any;
  navigation: any;
}

export const AccountSettings = ({route, navigation}: AccountSettingsProps) => {
  const {isLoggedIn, isLoading} = useUserData();

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  if (!isLoading && isLoggedIn) {
    return <LogoutScreen />;
  } else if (!isLoading && !isLoggedIn) {
    return <LoginScreen />;
  } else {
    return <></>;
  }
};
