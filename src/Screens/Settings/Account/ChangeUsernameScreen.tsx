import {useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React from 'react';
import {Text} from 'react-native-paper';

import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useUserUsernameMutation} from '#src/Queries/User/UserMutations';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {ChangeUsernameScreenBase} from '#src/Screens/Settings/Account/ChangeUsernameScreenBase';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {ChangeUsernameFormValues} from '#src/Types/FormValues';

/**
 * Account-settings screen for changing the current user's own username.
 */
export const ChangeUsernameScreen = () => {
  const {data: profilePublicData} = useUserProfileQuery();
  const navigation = useNavigation();
  const usernameMutation = useUserUsernameMutation();
  const queryClient = useQueryClient();
  const {setSnackbarPayload} = useSnackbar();

  /**
   * Submit a self-service username change and invalidate this user's profile caches.
   */
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
    <ChangeUsernameScreenBase currentUsername={profilePublicData.header.username} onSubmit={onSubmit}>
      <PaddedContentView>
        <Text>To prevent abuse, you're only allowed to change your username once per day. Choose wisely!</Text>
      </PaddedContentView>
    </ChangeUsernameScreenBase>
  );
};
