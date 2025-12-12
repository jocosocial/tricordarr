import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React from 'react';

import {UserProfileForm} from '#src/Components/Forms/User/UserProfileForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {DinnerTeam} from '#src/Enums/DinnerTeam';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserProfileMutation} from '#src/Queries/User/UserProfileMutations';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';
import {UserHeader, UserProfileUploadData} from '#src/Structs/ControllerStructs';
import {UserProfileFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.userProfileEditScreen>;

export const UserProfileEditScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={'/profile/edit'}>
        <UserProfileEditScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const UserProfileEditScreenInner = ({route, navigation}: Props) => {
  const profileMutation = useUserProfileMutation();
  const queryClient = useQueryClient();
  const initialValues: UserProfileFormValues = {
    displayName: route.params.user.header.displayName || '',
    realName: route.params.user.realName,
    preferredPronoun: route.params.user.header.preferredPronoun || '',
    homeLocation: route.params.user.homeLocation,
    roomNumber: route.params.user.roomNumber,
    email: route.params.user.email,
    message: route.params.user.message,
    about: route.params.user.about,
    dinnerTeam: route.params.user.dinnerTeam || '',
  };

  const onSubmit = (values: UserProfileFormValues, helpers: FormikHelpers<UserProfileFormValues>) => {
    helpers.setSubmitting(true);
    const postData: UserProfileUploadData = {
      displayName: values.displayName,
      realName: values.realName,
      homeLocation: values.homeLocation,
      roomNumber: values.roomNumber,
      email: values.email,
      message: values.message,
      about: values.about,
      preferredPronoun: values.preferredPronoun,
      ...(values.dinnerTeam ? {dinnerTeam: values.dinnerTeam as DinnerTeam} : undefined),
      header: route.params.user.header,
    };
    profileMutation.mutate(
      {
        profileData: postData,
      },
      {
        onSettled: () => helpers.setSubmitting(false),
        onSuccess: async () => {
          const invalidations = UserHeader.getCacheKeys(route.params.user.header).map(key => {
            return queryClient.invalidateQueries({queryKey: key});
          });
          await Promise.all(invalidations);
          navigation.goBack();
        },
      },
    );
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <UserProfileForm initialValues={initialValues} onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
