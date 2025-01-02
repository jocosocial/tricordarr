import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppView} from '../../Views/AppView';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {UserProfileUploadData} from '../../../libraries/Structs/ControllerStructs';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserProfileForm} from '../../Forms/User/UserProfileForm.tsx';
import {UserProfileFormValues} from '../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {useUserProfileMutation} from '../../Queries/User/UserProfileMutations.ts';
import {useQueryClient} from '@tanstack/react-query';
import {DinnerTeam} from '../../../libraries/Enums/DinnerTeam';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.editUserProfileScreen>;

export const EditUserProfileScreen = ({route, navigation}: Props) => {
  const profileMutation = useUserProfileMutation();
  const {profilePublicData, setProfilePublicData} = useUserData();
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
        onSuccess: response => {
          if (profilePublicData && profilePublicData.header.userID === route.params.user.header.userID) {
            setProfilePublicData(response.data);
          }
          queryClient.setQueryData([`/users/${route.params.user.header.userID}/profile`, undefined], () => {
            return response.data;
          });
          navigation.goBack();
        },
      },
    );
  };

  return (
    <AppView safeEdges={['bottom']}>
      <ScrollingContentView>
        <PaddedContentView>
          <UserProfileForm initialValues={initialValues} onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
