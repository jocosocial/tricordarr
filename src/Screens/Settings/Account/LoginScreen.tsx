import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {Text} from 'react-native-paper';

import {LoginForm} from '#src/Components/Forms/User/LoginForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useOnboardingCommit} from '#src/Hooks/useOnboardingCommit';
import {useTwitarrWebview} from '#src/Hooks/useTwitarrWebview';
import {normalizeServerUrl} from '#src/Libraries/ServerUrl';
import {OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {useLoginMutation} from '#src/Queries/Auth/LoginMutations';
import {LoginFormValues} from '#src/Types/FormValues';

/**
 * Log in to a server. The server is explicit: the route's `serverUrl` (add account, sign a revoked
 * account back in), else the active session's. Logging in never signs anyone else out; the new
 * account is added beside the existing ones and becomes the active one. Inside the setup flow the
 * route's `mode` decides what else the sign-in does (see useOnboardingCommit).
 */
export const LoginScreen = () => {
  // Hooks rather than screen props: the setup stack renders this screen too. Its params are a
  // superset of the Settings stack's.
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OobeStackParamList, 'LoginScreen'>>();
  const mode = route.params?.mode;
  const {commonStyles} = useStyles();
  const loginMutation = useLoginMutation();
  const {commitSignIn} = useOnboardingCommit(mode);
  const {serverUrl: sessionServerUrl} = useSwiftarrQueryClient();
  const {siteLogin} = useTwitarrWebview();
  const {setSnackbarPayload} = useSnackbar();
  const serverUrl = normalizeServerUrl(route.params?.serverUrl ?? sessionServerUrl);
  const recoveryParams = useMemo(() => ({serverUrl, mode}), [serverUrl, mode]);
  // The sign-in usually remounts the session scope, taking this screen with it.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onSubmit = useCallback(
    async (formValues: LoginFormValues, formikHelpers: FormikHelpers<LoginFormValues>) => {
      try {
        const response = await loginMutation.mutateAsync({serverUrl, ...formValues});
        const siteCookie = await siteLogin(formValues, serverUrl);
        const account = await commitSignIn(serverUrl, response.data, siteCookie);
        // The account switch lands on the new session's home (or the next setup step). Client
        // settings and roles re-key on the new session and fetch on their own.
        // First run and boarding carry on to the permissions step, where the toast would only
        // sit over its buttons; the setup flow is its own confirmation.
        if (mode !== 'firstRun' && mode !== 'boarding') {
          setSnackbarPayload({
            message: `Signed in as ${account.username || formValues.username}`,
            messageType: 'success',
          });
        }
        // Signing in to the account that is already active keeps the same scope and this screen.
        if (mounted.current) {
          navigation.goBack();
        }
      } catch {
        // The mutation's own onError already showed the failure.
      } finally {
        formikHelpers.setSubmitting(false);
      }
    },
    [loginMutation, serverUrl, siteLogin, commitSignIn, navigation, setSnackbarPayload, mode],
  );

  return (
    <AppView disablePreRegistrationWarning={!!mode}>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <Text style={commonStyles.marginBottom}>Logging in to {serverUrl}.</Text>
          <Text style={commonStyles.marginBottom}>Usernames are case-insensitive.</Text>
          <LoginForm onSubmit={onSubmit} initialUsername={route.params?.username} recoveryParams={recoveryParams} />
        </PaddedContentView>
      </ScrollingContentView>
      {mode && <OobeButtonsView leftOnPress={() => navigation.goBack()} />}
    </AppView>
  );
};
