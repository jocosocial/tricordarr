import React, {useCallback} from 'react';
import {Text} from 'react-native-paper';
import {LoginForm} from '../../../Forms/LoginForm';
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
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {startForegroundServiceWorker} from '../../../../libraries/Service';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const loginMutation = useLoginQuery();
  const {signIn} = useAuth();
  const {appConfig} = useConfig();

  const onSubmit = useCallback(
    (formValues: LoginFormValues, formikHelpers: FormikHelpers<LoginFormValues>) => {
      loginMutation.mutate(formValues, {
        onSuccess: response => {
          signIn(response.data).then(() => {
            startForegroundServiceWorker();
            navigation.goBack();
          });
        },
        onSettled: () => formikHelpers.setSubmitting(false),
      });
    },
    [loginMutation, navigation, signIn],
  );

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <Text style={commonStyles.marginBottom}>Logging in to {appConfig.serverUrl}.</Text>
          <Text style={commonStyles.marginBottom}>Usernames are case-insensitive.</Text>

          <LoginForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
