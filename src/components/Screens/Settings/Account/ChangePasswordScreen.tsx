import React from 'react';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {ChangePasswordForm} from '../../../Forms/User/ChangePasswordForm.tsx';
import {ChangePasswordFormValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {Text} from 'react-native-paper';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {useErrorHandler} from '../../../Context/Contexts/ErrorHandlerContext';
import {useNavigation} from '@react-navigation/native';
import {useUserPasswordMutation} from '../../../Queries/User/UserQueries';

export const ChangePasswordScreen = () => {
  const {profilePublicData} = useUserData();
  const navigation = useNavigation();
  const {appConfig} = useConfig();
  const passwordMutation = useUserPasswordMutation();
  const {setInfoMessage} = useErrorHandler();
  const onSubmit = (values: ChangePasswordFormValues, helper: FormikHelpers<ChangePasswordFormValues>) => {
    passwordMutation.mutate(
      {
        userPasswordData: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      },
      {
        onSuccess: () => {
          setInfoMessage('Successfully changed password!');
          navigation.goBack();
        },
        onSettled: () => helper.setSubmitting(false),
      },
    );
  };

  if (!profilePublicData) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>
            Changing password for user {profilePublicData.header.username} on server {appConfig.serverUrl}.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <ChangePasswordForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
