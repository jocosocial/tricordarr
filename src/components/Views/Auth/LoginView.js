import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useTheme, Text} from 'react-native-paper';
import {LoginForm} from '../../forms/Login';
import {AppSettings} from '../../../libraries/AppSettings';
import {getAuthHeaders} from "../../../libraries/APIClient";

// @ts-ignore
export const LoginView = () => {
  const theme = useTheme();
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      setServerUrl(await AppSettings.SERVER_URL.getValue());
    };
    loadSettings();
  }, []);

  const fetchData = useCallback(async credentials => {
    console.log('FetchData');
  }, []);

  const onSubmit = useCallback(
    async formValues => {
      await fetchData(formValues).catch(e => {
        console.log(e);
        // setErrorMessage(e.toString());
      });
    },
    [fetchData],
  );

  return (
    <View style={{backgroundColor: theme.colors.background, padding: 20}}>
      <Text style={{paddingBottom: 20}}>Logging in to {serverUrl}.</Text>
      <LoginForm onSubmit={onSubmit} />
    </View>
  );
};
