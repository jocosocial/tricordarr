import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  BottomTabComponents,
  MainStackComponents,
  NavigatorIDs,
  SeamailStackScreenComponents,
} from '../../../libraries/Enums/Navigation';
import {AppView} from '../../Views/AppView';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {UserHeader, UserProfileUploadData} from '../../../libraries/Structs/ControllerStructs';
import {RefreshControl, View} from 'react-native';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {AppImage} from '../../Images/AppImage';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {UserProfileActionsMenu} from '../../Menus/UserProfileActionsMenu';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {BlockedOrMutedBanner} from '../../Banners/BlockedOrMutedBanner';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext';
import {UserContentCard} from '../../Cards/UserProfile/UserContentCard';
import {UserAboutCard} from '../../Cards/UserProfile/UserAboutCard';
import {UserProfileCard} from '../../Cards/UserProfile/UserProfileCard';
import {UserNoteCard} from '../../Cards/UserProfile/UserNoteCard';
import {AppIcon} from '../../Images/AppIcon';
import {useUserProfileQuery} from '../../Queries/Users/UserProfileQueries';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {useBottomTabNavigator} from '../../Navigation/Tabs/BottomTabNavigator';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {UserProfileForm} from '../../Forms/UserProfileForm';
import {FezFormValues, UserProfileFormValues} from '../../../libraries/Types/FormValues';
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
