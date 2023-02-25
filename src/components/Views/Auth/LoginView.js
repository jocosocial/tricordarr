import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {LoginForm} from '../../forms/LoginForm';
import {AppSettings} from '../../../libraries/AppSettings';
import {getAuthHeaders} from '../../../libraries/APIClient';
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {useUserContext} from '../../Contexts/UserContext';

export const LoginView = () => {
  const theme = useTheme();
  const [serverUrl, setServerUrl] = useState('');
  const navigation = useNavigation();
  const {setIsUserLoggedIn} = useUserContext();

  useEffect(() => {
    const loadSettings = async () => {
      setServerUrl(await AppSettings.SERVER_URL.getValue());
    };
    loadSettings();
  }, []);

  const loginMutation = useMutation(
    async ({username, password}) => {
      console.log('Creds:', username, password);
      // https://github.com/axios/axios/issues/2235
      let authHeaders = getAuthHeaders(username, password);
      return await axios.post('/auth/login', {}, {headers: authHeaders});
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
        },
      });
    },
    [loginMutation, navigation, setIsUserLoggedIn],
  );

  return (
    <View style={{backgroundColor: theme.colors.background, padding: 20}}>
      <Text style={{paddingBottom: 20}}>Logging in to {serverUrl}.</Text>
      <LoginForm onSubmit={onSubmit} />
    </View>
  );
};
