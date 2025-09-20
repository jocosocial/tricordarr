import React, {useCallback} from 'react';
import {Text} from 'react-native-paper';
import {LoginForm} from '../../../Forms/User/LoginForm.tsx';
import {useNavigation} from '@react-navigation/native';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {AppView} from '../../../Views/AppView.tsx';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {LoginFormValues} from '../../../../Libraries/Types/FormValues.ts';
import {commonStyles} from '../../../../Styles/index.ts';
import {useLoginMutation} from '../../../Queries/Auth/LoginMutations.ts';
import {FormikHelpers} from 'formik';
import {useAuth} from '../../../Context/Contexts/AuthContext.ts';
import {useConfig} from '../../../Context/Contexts/ConfigContext.ts';
import {startForegroundServiceWorker} from '../../../../Libraries/Service.ts';
import {useClientConfigQuery} from '../../../Queries/Client/ClientQueries.ts';
import {useSwiftarrQueryClient} from '../../../Context/Contexts/SwiftarrQueryClientContext.ts';

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
