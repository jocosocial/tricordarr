import {useNavigation} from '@react-navigation/native';
import {FormikHelpers} from 'formik';
import React, {useCallback} from 'react';
import {Text} from 'react-native-paper';

import {LoginForm} from '#src/Components/Forms/User/LoginForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {startPushProvider} from '#src/Libraries/Notifications/Push';
import {useLoginMutation} from '#src/Queries/Auth/LoginMutations';
import {commonStyles} from '#src/Styles';
import {LoginFormValues} from '#src/Types/FormValues';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const loginMutation = useLoginMutation();
  const {signIn} = useAuth();
  const {appConfig, oobeCompleted} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  const {updateClientSettings} = useClientSettings();
  const {refetch: refetchRoles} = useRoles();

  const onSubmit = useCallback(
    (formValues: LoginFormValues, formikHelpers: FormikHelpers<LoginFormValues>) => {
      loginMutation.mutate(formValues, {
        onSuccess: async response => {
          await signIn(response.data, appConfig.preRegistrationMode);
          if (oobeCompleted) {
            await startPushProvider();
          }
          /**
           * This is a hack to wait a beat for the login processing to complete.
           * I never could find a way to get updateClientSettings() to fire off
           * immediately after login and not get an `undefined` payload. The query
           * function never even fired. So this is gonna have to do until we figure
           * out something better.
           */
          setTimeout(async () => {
            await Promise.all([updateClientSettings(), refetchRoles()]);
          }, 1000);
          navigation.goBack();
        },
        onSettled: () => formikHelpers.setSubmitting(false),
      });
    },
    [
      loginMutation,
      signIn,
      appConfig.preRegistrationMode,
      oobeCompleted,
      updateClientSettings,
      navigation,
      refetchRoles,
    ],
  );

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <Text style={commonStyles.marginBottom}>Logging in to {serverUrl}.</Text>
          <Text style={commonStyles.marginBottom}>Usernames are case-insensitive.</Text>
          <LoginForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
