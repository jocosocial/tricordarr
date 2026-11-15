import {useNavigation} from '@react-navigation/native';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Text} from 'react-native-paper';

import {LoginForm} from '#src/Components/Forms/User/LoginForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTwitarrWebview} from '#src/Hooks/useTwitarrWebview';
import {startPushProvider} from '#src/Libraries/Notifications/Push';
import {useLoginMutation} from '#src/Queries/Auth/LoginMutations';
import {LoginFormValues} from '#src/Types/FormValues';

export const LoginScreen = () => {
  const {commonStyles} = useStyles();
  const navigation = useNavigation();
  const loginMutation = useLoginMutation();
  const {signIn} = useSession();
  const {oobeCompleted} = useOobe();
  const {serverUrl} = useSwiftarrQueryClient();
  const {currentSession, findOrCreateSession} = useSession();
  const {appConfig} = useConfig();
  const [isSessionReady, setIsSessionReady] = useState(false);
  const {signIn: signInWebview} = useTwitarrWebview();

  // Create session on mount if none exists
  useEffect(() => {
    const initializeSession = async () => {
      if (!currentSession) {
        // Create a default session if none exists
        await findOrCreateSession(appConfig.serverUrl, false);
      }
      setIsSessionReady(true);
    };

    initializeSession();
  }, [currentSession, findOrCreateSession, appConfig.serverUrl]);

  const onSubmit = useCallback(
    (formValues: LoginFormValues, formikHelpers: FormikHelpers<LoginFormValues>) => {
      loginMutation.mutate(formValues, {
        onSuccess: async response => {
          signInWebview(formValues);
          await signIn(response.data);
          if (oobeCompleted) {
            await startPushProvider();
          }
          // Client settings and roles re-key on the new userID and fetch on their own;
          // ClientSettingsProvider and RoleProvider apply the results.
          navigation.goBack();
        },
        onSettled: () => formikHelpers.setSubmitting(false),
      });
    },
    [loginMutation, signIn, oobeCompleted, navigation, signInWebview],
  );

  if (!isSessionReady) {
    return (
      <AppView>
        <ScrollingContentView isStack={true}>
          <PaddedContentView padTop={true}>
            <ActivityIndicator />
          </PaddedContentView>
        </ScrollingContentView>
      </AppView>
    );
  }

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
