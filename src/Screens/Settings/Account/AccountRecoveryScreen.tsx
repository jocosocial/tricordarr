import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import React, {useState} from 'react';
import {UserRecoveryForm} from '#src/Components/Forms/User/UserRecoveryForm';
import {UserRegistrationFormValues} from '#src/Types/FormValues';
import {FormikHelpers} from 'formik';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useUserRecoveryMutation} from '#src/Queries/Auth/RecoveryMutations';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.accountRecoveryScreen>;

export const AccountRecoveryScreen = ({navigation}: Props) => {
  const recoveryMutation = useUserRecoveryMutation();
  const [tokenData, setTokenData] = useState<TokenStringData>();
  const onSubmit = (values: UserRegistrationFormValues, helpers: FormikHelpers<UserRegistrationFormValues>) => {
    recoveryMutation.mutate(
      {
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
      <AppView>
        <ScrollingContentView>
          <PaddedContentView>
            <Text>Successfully recovered your account! Please go back and log in with your new password.</Text>
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton buttonText={'Back to Login'} onPress={() => navigation.goBack()} />
          </PaddedContentView>
        </ScrollingContentView>
      </AppView>
    );
  }

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <UserRecoveryForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
