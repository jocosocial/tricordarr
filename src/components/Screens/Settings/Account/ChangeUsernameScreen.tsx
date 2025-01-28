import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {AppView} from '../../../Views/AppView';
import React from 'react';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {useNavigation} from '@react-navigation/native';
import {ChangeUsernameFormValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {ChangeUsernameForm} from '../../../Forms/User/ChangeUsernameForm.tsx';
import {useUserNotificationDataQuery} from '../../../Queries/Alert/NotificationQueries';
import {useUserUsernameMutation} from '../../../Queries/User/UserMutations.ts';
import {useSnackbar} from '../../../Context/Contexts/SnackbarContext.ts';
import {useSwiftarrQueryClient} from '../../../Context/Contexts/SwiftarrQueryClientContext.ts';
import {useUserProfileQuery} from '../../../Queries/User/UserQueries.ts';

export const ChangeUsernameScreen = () => {
  const {data: profilePublicData, refetch: refetchProfilePublicData} = useUserProfileQuery();
  const navigation = useNavigation();
  const {serverUrl} = useSwiftarrQueryClient();
  const usernameMutation = useUserUsernameMutation();
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();

  const {setSnackbarPayload} = useSnackbar();

  const onSubmit = (values: ChangeUsernameFormValues, helper: FormikHelpers<ChangeUsernameFormValues>) => {
    usernameMutation.mutate(
      {
        userUsernameData: values,
      },
      {
        onSuccess: () => {
          refetchProfilePublicData().then(() =>
            refetchUserNotificationData().then(() => {
              setSnackbarPayload({message: 'Successfully changed username!'});
              navigation.goBack();
            }),
          );
        },
        onSettled: () => {
          helper.setSubmitting(false);
        },
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
            Changing username for user {profilePublicData.header.username} on server {serverUrl}.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>To prevent abuse, you're only allowed to change your username once per day. Choose wisely!</Text>
        </PaddedContentView>
        <PaddedContentView>
          <ChangeUsernameForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
