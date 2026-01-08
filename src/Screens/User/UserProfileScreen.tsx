import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUsersProfileQuery} from '#src/Queries/Users/UsersQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {UserProfileScreenBase} from '#src/Screens/User/UserProfileScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.userProfileScreen>;

export const UserProfileScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.userProfileHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={'/profile'}>
          <UserProfileScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const UserProfileScreenInner = ({route}: Props) => {
  const {data, refetch, isLoading} = useUsersProfileQuery(route.params.userID);

  // This used to have isLoading for each of the [useUserBlocksQuery, useUserMutesQuery,
  // useUserFavoritesQuery].
  // But just the isLoading. I have no idea why I did this. They used to be in the
  // UserRelationsProvider but I moved them so that they wouldn't get refetched
  // on app startup (potentially a bad thing in low network).

  return <UserProfileScreenBase data={data} refetch={refetch} isLoading={isLoading} />;
};
