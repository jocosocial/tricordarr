import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {AppView} from '../../../Views/AppView';
import React from 'react';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {useNavigation} from '@react-navigation/native';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {useErrorHandler} from '../../../Context/Contexts/ErrorHandlerContext';
import {ChangeUsernameFormValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {ChangeUsernameForm} from '../../../Forms/User/ChangeUsernameForm.tsx';
import {useUserProfileQuery} from '../../../Queries/Users/UserProfileQueries.ts';
import {useUserNotificationDataQuery} from '../../../Queries/Alert/NotificationQueries';
import {useUserUsernameMutation} from '../../../Queries/User/UserMutations.ts';

export const ChangeUsernameScreen = () => {
  const {profilePublicData} = useUserData();
  const navigation = useNavigation();
  const {appConfig} = useConfig();
  const usernameMutation = useUserUsernameMutation();
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {refetch: refetchProfilePublicData} = useUserProfileQuery(profilePublicData?.header.userID);

  const {setInfoMessage} = useErrorHandler();

  const onSubmit = (values: ChangeUsernameFormValues, helper: FormikHelpers<ChangeUsernameFormValues>) => {
    usernameMutation.mutate(
      {
        userUsernameData: values,
      },
      {
        onSuccess: () => {
          refetchProfilePublicData().then(() =>
            refetchUserNotificationData().then(() => {
              setInfoMessage('Successfully changed username!');
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
            Changing username for user {profilePublicData.header.username} on server {appConfig.serverUrl}.
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
