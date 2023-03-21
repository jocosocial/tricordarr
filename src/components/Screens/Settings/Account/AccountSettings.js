import React, {useEffect} from 'react';
import {ScrollView} from 'react-native';
import {LoginScreen} from './LoginScreen';
import {LogoutScreen} from './LogoutScreen';
import {AppView} from '../../../Views/AppView';
import {useUserData} from '../../../Context/Contexts/UserDataContext';

export const AccountSettings = ({route, navigation}) => {
  const {isLoggedIn, isLoading} = useUserData();

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  return (
    <AppView>
      <ScrollView>
        {!isLoading && isLoggedIn && <LogoutScreen />}
        {!isLoading && !isLoggedIn && <LoginScreen />}
      </ScrollView>
    </AppView>
  );
};
