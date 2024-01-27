import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import React, {useState} from 'react';
import {UserRecoveryForm} from '../../../Forms/UserRecoveryForm';
import {UserRegistrationFormValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {useUserRecoveryMutation} from '../../../Queries/Auth/RecoveryQueries';
import {TokenStringData} from '../../../../libraries/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens';

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
