import {RouteProp, useRoute} from '@react-navigation/native';
import {FormikHelpers} from 'formik';
import React, {useCallback, useState} from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {UserCreateForm} from '#src/Components/Forms/User/UserCreateForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTwitarrWebview} from '#src/Hooks/useTwitarrWebview';
import {normalizeServerUrl} from '#src/Libraries/ServerUrl';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {useLoginMutation} from '#src/Queries/Auth/LoginMutations';
import {useUserCreateMutation} from '#src/Queries/User/UserMutations';
import {LoginFormValues, UserRegistrationFormValues} from '#src/Types/FormValues';

/**
 * Create an account on a server (the route's, else the active session's) and log in to it. The
 * sign-in itself is left to RecoveryKeyScreen: signing in replaces the navigators, so the recovery
 * key has to be shown and acknowledged first. Like login, this adds the account beside any
 * existing ones rather than replacing them.
 */
export const RegisterScreen = () => {
  const createMutation = useUserCreateMutation();
  const loginMutation = useLoginMutation();
  const navigation = useCommonStack();
  const [refreshing, setRefreshing] = useState(false);
  const {serverUrl: sessionServerUrl} = useSwiftarrQueryClient();
  // Hooks rather than screen props, matching LoginScreen.
  const route = useRoute<RouteProp<OobeStackParamList, 'RegisterScreen'>>();
  const mode = route.params?.mode;
  const serverUrl = normalizeServerUrl(route.params?.serverUrl ?? sessionServerUrl);
  const {siteLogin} = useTwitarrWebview();

  const onSubmit = useCallback(
    async (formValues: UserRegistrationFormValues, formikHelpers: FormikHelpers<UserRegistrationFormValues>) => {
      setRefreshing(true);
      try {
        const userCreateResponse = await createMutation.mutateAsync({serverUrl, ...formValues});
        const loginValues: LoginFormValues = {
          username: formValues.username,
          password: formValues.password,
        };
        const response = await loginMutation.mutateAsync({serverUrl, ...loginValues});
        const siteCookie = await siteLogin(loginValues, serverUrl);
        navigation.replace(CommonStackComponents.recoveryKeyScreen, {
          recoveryKey: userCreateResponse.data.recoveryKey,
          username: userCreateResponse.data.username,
          serverUrl,
          pendingSignIn: {token: response.data, siteCookie, mode},
        });
      } catch {
        // The mutations' own onError already showed the failure.
      } finally {
        formikHelpers.setSubmitting(false);
        setRefreshing(false);
      }
    },
    [createMutation, loginMutation, serverUrl, siteLogin, mode, navigation],
  );

  return (
    <AppView disablePreRegistrationWarning={!!mode}>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl enabled={false} refreshing={refreshing} />}>
        <PaddedContentView padTop={true}>
          <Text>
            Your Twitarr registration code was sent to you via e-mail. If you did not receive your registration code or
            do not have access to your e-mail, go to the JoCo Cruise Info Desk for assistance.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            Your registration code can only be used once. Do not share it with others. You will be held accountable for
            the actions of ANYONE using your code.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            If you need an additional code to create an additional account, please request one at the JoCo Cruise Info
            Desk.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <UserCreateForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
      {mode && <OobeButtonsView leftOnPress={() => navigation.goBack()} leftDisabled={refreshing} />}
    </AppView>
  );
};
