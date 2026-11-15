import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React, {useState} from 'react';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {UserRecoveryForm} from '#src/Components/Forms/User/UserRecoveryForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {normalizeServerUrl} from '#src/Libraries/ServerUrl';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUserRecoveryMutation} from '#src/Queries/Auth/RecoveryMutations';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {UserRegistrationFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.accountRecoveryScreen>;

/**
 * Reset a forgotten password. Reached from the login form, so it acts on the server that form was
 * logging in to (the route's, else the active session's).
 */
export const AccountRecoveryScreen = ({navigation, route}: Props) => {
  const recoveryMutation = useUserRecoveryMutation();
  const {commonStyles} = useStyles();
  const {serverUrl: sessionServerUrl} = useSwiftarrQueryClient();
  const serverUrl = normalizeServerUrl(route.params?.serverUrl ?? sessionServerUrl);
  const inSetupFlow = !!route.params?.mode;
  const [tokenData, setTokenData] = useState<TokenStringData>();
  const onSubmit = (values: UserRegistrationFormValues, helpers: FormikHelpers<UserRegistrationFormValues>) => {
    recoveryMutation.mutate(
      {
        serverUrl,
        username: values.username,
        recoveryKey: values.verification,
        newPassword: values.password,
      },
      {
        onSuccess: response => {
          setTokenData(response.data);
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  if (tokenData) {
    return (
      <AppView disablePreRegistrationWarning={inSetupFlow}>
        <ScrollingContentView>
          <PaddedContentView>
            <Text>Successfully recovered your account! Please go back and log in with your new password.</Text>
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              testID={'backToLogin-button'}
              buttonText={'Back to Login'}
              onPress={() => navigation.goBack()}
            />
          </PaddedContentView>
        </ScrollingContentView>
      </AppView>
    );
  }

  return (
    <AppView disablePreRegistrationWarning={inSetupFlow}>
      <ScrollingContentView>
        <PaddedContentView>
          <Text style={commonStyles.marginBottom}>Recovering your account on {serverUrl}.</Text>
          <UserRecoveryForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
