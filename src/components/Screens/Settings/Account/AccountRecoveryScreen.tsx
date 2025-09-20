import {AppView} from '../../../Views/AppView.tsx';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import React, {useState} from 'react';
import {UserRecoveryForm} from '../../../Forms/User/UserRecoveryForm.tsx';
import {UserRegistrationFormValues} from '../../../../Libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {useUserRecoveryMutation} from '../../../Queries/Auth/RecoveryMutations.ts';
import {TokenStringData} from '../../../../Libraries/Structs/ControllerStructs.tsx';
import {Text} from 'react-native-paper';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens.tsx';

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
