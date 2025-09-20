import {useNavigation} from '@react-navigation/native';
import {FormikHelpers} from 'formik';
import React from 'react';
import {Text} from 'react-native-paper';

import {ChangePasswordForm} from '#src/Components/Forms/User/ChangePasswordForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useUserPasswordMutation} from '#src/Queries/User/UserMutations';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {ChangePasswordFormValues} from '#src/Types/FormValues';

export const ChangePasswordScreen = () => {
  const {data: profilePublicData} = useUserProfileQuery();
  const navigation = useNavigation();
  const {serverUrl} = useSwiftarrQueryClient();
  const passwordMutation = useUserPasswordMutation();
  const {setSnackbarPayload} = useSnackbar();

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
          setSnackbarPayload({message: 'Successfully changed password!'});
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
            Changing password for user {profilePublicData.header.username} on server {serverUrl}.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <ChangePasswordForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
