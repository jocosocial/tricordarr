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
  const {setIsLoading, setIsLoggedIn} = useUserData();
  const {setErrorMessage, setErrorBanner} = useErrorHandler();

  useEffect(() => {
    const loadSettings = async () => {
      setServerUrl(await AppSettings.SERVER_URL.getValue());
    };
    loadSettings();
  }, []);

  const loginMutation = useMutation(
    async ({username, password}) => {
      console.log('Creds:', username, password);
      // Axios and the base64 encoding get weird, so we do it ourselves.
      // https://github.com/axios/axios/issues/2235
      let authHeaders = getAuthHeaders(username, password);
      // @TODO headers should not be allowed to be undefined.
      return await axios.post('/auth/login', {}, {headers: authHeaders});
    },
    {retry: 0},
  );

  const storeLoginData = useCallback(
    async data => {
      await AppSettings.AUTH_TOKEN.setValue(data.data.token);
      await AppSettings.USER_ID.setValue(data.data.userID);
      await setIsLoggedIn(true);
      await setIsLoading(false);
      // I don't love this.
      setErrorBanner('');
      setErrorMessage('');
      navigation.goBack();
    },
    [navigation, setIsLoggedIn, setIsLoading],
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
