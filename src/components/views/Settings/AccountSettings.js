import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView} from 'react-native';
import {LoginView} from '../../Views/Auth/LoginView';
import {LogoutView} from '../../Views/Auth/LogoutView';
import {AppSettings} from '../../../libraries/AppSettings';

export const AccountSettings = ({route, navigation}) => {
  const {isLoggedIn} = route.params;

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  return (
    <SafeAreaView>
      <ScrollView>
        {isLoggedIn && <LogoutView />}
        {!isLoggedIn && <LoginView />}
      </ScrollView>
    </SafeAreaView>
  );
};
