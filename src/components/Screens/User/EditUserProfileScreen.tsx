import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {AppView} from '../../Views/AppView';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {UserProfileUploadData} from '../../../libraries/Structs/ControllerStructs';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {UserProfileForm} from '../../Forms/UserProfileForm';
import {UserProfileFormValues} from '../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {useUserProfileMutation} from '../../Queries/User/UserProfileQueries';
import {useQueryClient} from '@tanstack/react-query';

export type Props = NativeStackScreenProps<
  MainStackParamList,
  MainStackComponents.editUserProfileScreen,
  NavigatorIDs.mainStack
>;

export const EditUserProfileScreen = ({route, navigation}: Props) => {
  const profileMutation = useUserProfileMutation();
  const {profilePublicData, setProfilePublicData} = useUserData();
  const queryClient = useQueryClient();
  const initialValues: UserProfileFormValues = {
    displayName: route.params.user.header.displayName || '',
    realName: route.params.user.realName,
    preferredPronoun: route.params.user.preferredPronoun,
    homeLocation: route.params.user.homeLocation,
    roomNumber: route.params.user.roomNumber,
    email: route.params.user.email,
    message: route.params.user.message,
    about: route.params.user.about,
  };

  const onSubmit = (values: UserProfileFormValues, helpers: FormikHelpers<UserProfileFormValues>) => {
    helpers.setSubmitting(true);
    // console.log(values);
    const postData: UserProfileUploadData = {
      ...values,
      header: route.params.user.header,
    };
    console.log(postData);
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
          queryClient.setQueryData([`/users/${route.params.user.header.userID}/profile`], () => {
            return response.data;
          });
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
