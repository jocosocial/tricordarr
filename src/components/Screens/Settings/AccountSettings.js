import React, {useEffect} from 'react';
import {ScrollView} from 'react-native';
import {LoginView} from '../../Views/Auth/LoginView';
import {LogoutView} from '../../Views/Auth/LogoutView';
import {AppView} from '../../Views/AppView';
import {useUserData} from '../../Context/Contexts/UserDataContext';

export const AccountSettings = ({route, navigation}) => {
  const {isLoggedIn, isLoading} = useUserData();

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  return (
    <AppView>
      <ScrollView>
        {!isLoading && isLoggedIn && <LogoutView />}
        {!isLoading && !isLoggedIn && <LoginView />}
      </ScrollView>
    </AppView>
  );
};
