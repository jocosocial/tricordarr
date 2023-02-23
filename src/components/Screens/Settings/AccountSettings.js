import React, {useContext, useEffect, useState} from 'react';
import {SafeAreaView, ScrollView} from 'react-native';
import {LoginView} from '../../Views/Auth/LoginView';
import {LogoutView} from '../../Views/Auth/LogoutView';
import {AppSettings} from '../../../libraries/AppSettings';
import {UserContext} from '../../../../App';

export const AccountSettings = ({route, navigation}) => {
  const {isUserLoggedIn} = useContext(UserContext);

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  return (
    <SafeAreaView>
      <ScrollView>
        {isUserLoggedIn && <LogoutView />}
        {!isUserLoggedIn && <LoginView />}
      </ScrollView>
    </SafeAreaView>
  );
};
