import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppView} from '../../Views/AppView.tsx';
import {UserHeader, UserProfileUploadData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {UserProfileForm} from '../../Forms/User/UserProfileForm.tsx';
import {UserProfileFormValues} from '../../../Libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {useUserProfileMutation} from '../../Queries/User/UserProfileMutations.ts';
import {useQueryClient} from '@tanstack/react-query';
import {DinnerTeam} from '../../../Libraries/Enums/DinnerTeam.ts';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.userProfileEditScreen>;

export const UserProfileEditScreen = ({route, navigation}: Props) => {
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
            return queryClient.invalidateQueries(key);
          });
          await Promise.all(invalidations);
          navigation.goBack();
        },
      },
    );
  };

  return (
    <AppView safeEdges={route.params.oobe ? ['bottom'] : []}>
      <ScrollingContentView>
        <PaddedContentView>
          <UserProfileForm initialValues={initialValues} onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
