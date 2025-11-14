import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';

import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUsersProfileQuery} from '#src/Queries/Users/UsersQueries';
import {UserProfileScreenBase} from '#src/Screens/User/UserProfileScreenBase';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.userProfileScreen>;

export const UserProfileScreen = ({route}: Props) => {
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
      oobe={route.params.oobe}
    />
  );
};
