import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useTheme, Text} from 'react-native-paper';
import {LoginForm} from '../../forms/LoginForm';
import {AppSettings} from '../../../libraries/AppSettings';
import {getAuthHeaders} from "../../../libraries/APIClient";
import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {useNavigation} from '@react-navigation/native';
import {UserContext} from '../../../../App';

export const LoginView = () => {
  const theme = useTheme();
  const [serverUrl, setServerUrl] = useState('');
  const navigation = useNavigation();
  const {setIsUserLoggedIn} = useContext(UserContext);

  useEffect(() => {
    const loadSettings = async () => {
      setServerUrl(await AppSettings.SERVER_URL.getValue());
    };
    loadSettings();
  }, []);

  const loginMutation = useMutation(
    async ({username, password}) => {
      // const username = formValues.username;
      // const password = formValues.password;
      console.log('Creds:', username, password);
      // https://github.com/axios/axios/issues/2235
      // let response = await axios.post('/auth/login', {}, {auth: {username: username, password: password}});
      let authHeaders = getAuthHeaders(username, password);
      let response = await axios.post('/auth/login', {}, {headers: authHeaders});
      return response;
    },
    {retry: 0},
  );

  const onSubmit = useCallback(
    async formValues => {
      loginMutation.mutate(formValues, {
        onSuccess: (data, variables, context) => {
          AppSettings.AUTH_TOKEN.setValue(data.data.token);
          AppSettings.USERNAME.setValue(variables.username);
          setIsUserLoggedIn(true);
          navigation.goBack();
          // console.log('data', data.data);
          // console.log('vars', variables);
          // console.log('context', context);

        },
      });
    },
    [loginMutation],
  );

  return (
    <View style={{backgroundColor: theme.colors.background, padding: 20}}>
      <Text style={{paddingBottom: 20}}>Logging in to {serverUrl}.</Text>
      <LoginForm onSubmit={onSubmit} />
    </View>
  );
};
