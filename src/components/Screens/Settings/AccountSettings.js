import React, {useEffect} from 'react';
import {ScrollView} from 'react-native';
import {LoginView} from '../../Views/Auth/LoginView';
import {LogoutView} from '../../Views/Auth/LogoutView';
import {useUserContext} from '../../Contexts/UserContext';
import {AppView} from '../../Views/AppView';

export const AccountSettings = ({route, navigation}) => {
  const {isUserLoggedIn} = useUserContext();

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  return (
    <AppView>
      <ScrollView>
        {isUserLoggedIn && <LogoutView />}
        {!isUserLoggedIn && <LoginView />}
      </ScrollView>
    </AppView>
  );
};
