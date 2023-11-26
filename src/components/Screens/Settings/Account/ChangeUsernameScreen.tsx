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
import {ChangeUsernameForm} from '../../../Forms/ChangeUsernameForm';
import {useUserProfileQuery, useUserUsernameMutation} from '../../../Queries/User/UserQueries';
import {useUserNotificationData} from '../../../Context/Contexts/UserNotificationDataContext';

export const ChangeUsernameScreen = () => {
  const {profilePublicData} = useUserData();
  const navigation = useNavigation();
  const {appConfig} = useConfig();
  const usernameMutation = useUserUsernameMutation();
  const {refetchUserNotificationData} = useUserNotificationData();
  const {refetch: refetchProfilePublicData} = useUserProfileQuery();

  const {setInfoMessage} = useErrorHandler();

  const onSubmit = (values: ChangeUsernameFormValues, helper: FormikHelpers<ChangeUsernameFormValues>) => {
    console.log(values);
    usernameMutation.mutate(
      {
        userUsernameData: values,
      },
      {
        onSuccess: () => {
          refetchProfilePublicData().then(() =>
            refetchUserNotificationData().then(() => {
              setInfoMessage('Successfully changed username!');
              helper.setSubmitting(false);
              navigation.goBack();
            }),
          );
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
