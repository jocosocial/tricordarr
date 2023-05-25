import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {LoginForm} from '../../../Forms/LoginForm';
import {AppSettings} from '../../../../libraries/AppSettings';
import {useNavigation} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {AppView} from '../../../Views/AppView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {LoginFormValues} from '../../../../libraries/Types/FormValues';
import {commonStyles} from '../../../../styles';
import {useLoginQuery} from '../../../Queries/Auth/LoginQueries';
import {FormikHelpers} from 'formik';
import {useAuth} from '../../../Context/Contexts/AuthContext';

export const LoginScreen = () => {
  const [serverUrl, setServerUrl] = useState('');
  const navigation = useNavigation();
  const loginMutation = useLoginQuery();
  const {signIn} = useAuth();

  useEffect(() => {
    const loadSettings = async () => {
      setServerUrl((await AppSettings.SERVER_URL.getValue()) ?? 'unknown server');
    };
    loadSettings();
  }, []);

  const onSubmit = useCallback(
    (formValues: LoginFormValues, formikHelpers: FormikHelpers<LoginFormValues>) => {
      loginMutation.mutate(formValues, {
        onSuccess: response => {
          signIn(response.data).then(() => {
            // Triggering NetInfo here can tell the other providers
            // that we may need to start the Foreground Service Worker.
            NetInfo.refresh();
            navigation.goBack();
          });
        },
      });
      formikHelpers.setSubmitting(false);
    },
    [loginMutation, navigation, signIn],
  );

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView>
          <Text style={commonStyles.marginBottom}>Logging in to {serverUrl}.</Text>
          <LoginForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
