import React from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {ChangePasswordForm} from '../../../Forms/User/ChangePasswordForm.tsx';
import {ChangePasswordFormValues} from '../../../../Libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {Text} from 'react-native-paper';
import {LoadingView} from '../../../Views/Static/LoadingView.tsx';
import {useNavigation} from '@react-navigation/native';
import {useUserPasswordMutation} from '../../../Queries/User/UserMutations.ts';
import {useSnackbar} from '../../../Context/Contexts/SnackbarContext.ts';
import {useSwiftarrQueryClient} from '../../../Context/Contexts/SwiftarrQueryClientContext.ts';
import {useUserProfileQuery} from '../../../Queries/User/UserQueries.ts';

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
