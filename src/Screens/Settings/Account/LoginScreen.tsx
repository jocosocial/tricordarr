import React, {useCallback} from 'react';
import {Text} from 'react-native-paper';
import {LoginForm} from '#src/Components/Forms/User/LoginForm';
import {useNavigation} from '@react-navigation/native';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {LoginFormValues} from '#src/Types/FormValues';
import {commonStyles} from '#src/Styles';
import {useLoginMutation} from '#src/Queries/Auth/LoginMutations';
import {FormikHelpers} from 'formik';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {startForegroundServiceWorker} from '#src/Libraries/Service';
import {useClientConfigQuery} from '#src/Queries/Client/ClientQueries';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const loginMutation = useLoginMutation();
  const {signIn} = useAuth();
  const {appConfig, updateAppConfig, oobeCompleted, preRegistrationMode} = useConfig();
  const {refetch: refetchClientConfig} = useClientConfigQuery({enabled: false});
  const {serverUrl} = useSwiftarrQueryClient();

  const updateClientConfig = useCallback(async () => {
    const response = await refetchClientConfig();
    if (response.data) {
      const [year, month, day] = response.data.spec.cruiseStartDate.split('-').map(Number);
      updateAppConfig({
        ...appConfig,
        cruiseLength: response.data.spec.cruiseLength,
        cruiseStartDate: new Date(year, month - 1, day),
        oobeExpectedVersion: response.data.spec.oobeVersion,
        portTimeZoneID: response.data.spec.portTimeZoneID,
        schedBaseUrl: response.data.spec.schedBaseUrl,
      });
    }
  }, [appConfig, refetchClientConfig, updateAppConfig]);

  const onSubmit = useCallback(
    (formValues: LoginFormValues, formikHelpers: FormikHelpers<LoginFormValues>) => {
      loginMutation.mutate(formValues, {
        onSuccess: async response => {
          await signIn(response.data, preRegistrationMode);
          if (oobeCompleted) {
            await startForegroundServiceWorker();
          }
          await updateClientConfig();
          navigation.goBack();
        },
        onSettled: () => formikHelpers.setSubmitting(false),
      });
    },
    [loginMutation, signIn, preRegistrationMode, oobeCompleted, updateClientConfig, navigation],
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
