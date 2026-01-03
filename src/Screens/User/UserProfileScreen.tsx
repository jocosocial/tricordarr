import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {useUsersProfileQuery} from '#src/Queries/Users/UsersQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {UserProfileScreenBase} from '#src/Screens/User/UserProfileScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.userProfileScreen>;

export const UserProfileScreen = (props: Props) => {
  const {data: profilePublicData} = useUserProfileQuery();
  // Cursor wrote this. I don't love it but it works so it's gonna stay.
  const isSelf = props.route.params.userID === profilePublicData?.header.userID;
  const content = (
    <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={'/profile'}>
      <UserProfileScreenInner {...props} />
    </DisabledFeatureScreen>
  );

  if (isSelf) {
    return content;
  }

  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.userProfileHelpScreen}>{content}</PreRegistrationScreen>
  );
};

const UserProfileScreenInner = ({route}: Props) => {
  const {data, refetch, isLoading} = useUsersProfileQuery(route.params.userID);

  // This used to have isLoading for each of the [useUserBlocksQuery, useUserMutesQuery,
  // useUserFavoritesQuery].
  // But just the isLoading. I have no idea why I did this. They used to be in the
  // UserRelationsProvider but I moved them so that they wouldn't get refetched
  // on app startup (potentially a bad thing in low network).

  return (
    <UserProfileScreenBase
      data={data}
      refetch={refetch}
      isLoading={isLoading}
      enableContent={route.params.enableContent}
    />
  );
};
