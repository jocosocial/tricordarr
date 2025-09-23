import {useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React from 'react';
import {Text} from 'react-native-paper';

import {ChangeUsernameForm} from '#src/Components/Forms/User/ChangeUsernameForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useUserUsernameMutation} from '#src/Queries/User/UserMutations';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {ChangeUsernameFormValues} from '#src/Types/FormValues';

export const ChangeUsernameScreen = () => {
  const {data: profilePublicData} = useUserProfileQuery();
  const navigation = useNavigation();
  const {serverUrl} = useSwiftarrQueryClient();
  const usernameMutation = useUserUsernameMutation();
  const queryClient = useQueryClient();

  const {setSnackbarPayload} = useSnackbar();

  const onSubmit = (values: ChangeUsernameFormValues, helper: FormikHelpers<ChangeUsernameFormValues>) => {
    usernameMutation.mutate(
      {
        userUsernameData: values,
      },
      {
        onSuccess: async () => {
          const invalidations = UserHeader.getCacheKeys(profilePublicData?.header).map(key => {
            return queryClient.invalidateQueries({queryKey: key});
          });
          await Promise.all(invalidations);
          setSnackbarPayload({message: 'Successfully changed username!'});
          navigation.goBack();
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
