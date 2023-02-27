import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {LoginForm} from '../../Forms/LoginForm';
import {AppSettings} from '../../../libraries/AppSettings';
import {getAuthHeaders} from '../../../libraries/Network/APIClient';
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

export const LoginView = () => {
  const theme = useTheme();
  const [serverUrl, setServerUrl] = useState('');
  const navigation = useNavigation();
  const {setTokenStringData} = useUserData();
  const {setErrorMessage} = useErrorHandler();

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

  const storeLoginData = useCallback(
    async data => {
      await setTokenStringData(data.data);
      await AppSettings.AUTH_TOKEN.setValue(data.data.token);
      await AppSettings.USER_ID.setValue(data.data.userID);
      navigation.goBack();
    },
    [navigation, setTokenStringData],
  );

  const onSubmit = useCallback(
    async formValues => {
      loginMutation.mutate(formValues, {
        onSuccess: storeLoginData,
        onError: error => setErrorMessage(error.response.data.reason),
      });
    },
    [loginMutation, setErrorMessage, storeLoginData],
  );

  return (
    <View style={{backgroundColor: theme.colors.background, padding: 20}}>
      <Text style={{paddingBottom: 20}}>Logging in to {serverUrl}.</Text>
      <LoginForm onSubmit={onSubmit} />
    </View>
  );
};
