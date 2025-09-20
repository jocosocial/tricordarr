import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {AppView} from '#src/Components/Views/AppView';
import React from 'react';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useNavigation} from '@react-navigation/native';
import {ChangeUsernameFormValues} from '#src/Types/FormValues';
import {FormikHelpers} from 'formik';
import {ChangeUsernameForm} from '#src/Components/Forms/User/ChangeUsernameForm';
import {useUserUsernameMutation} from '#src/Queries/User/UserMutations';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {useQueryClient} from '@tanstack/react-query';

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
            return queryClient.invalidateQueries(key);
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
