import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {UserProfileScreenBase} from './UserProfileScreenBase.tsx';
import {useUserMutesQuery} from '#src/Queries/Users/UserMuteQueries.ts';
import {useUserBlocksQuery} from '#src/Queries/Users/UserBlockQueries.ts';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries.ts';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens.tsx';
import {useUsersProfileQuery} from '#src/Queries/Users/UsersQueries.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.userProfileScreen>;

export const UserProfileScreen = ({route}: Props) => {
  const {data, refetch, isLoading} = useUsersProfileQuery(route.params.userID);

  // Moved these out of the UserRelationsProvider so that they wouldn't get refetched on app startup.
  // isLoading means that there is no data in the cache. They'll auto refetch (enabled is implicitly true here)
  // in the background after staleTime or on app reload when we hit this screen.
  const {isLoading: isLoadingBlocks} = useUserBlocksQuery();
  const {isLoading: isLoadingMutes} = useUserMutesQuery();
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();

  if (isLoadingBlocks || isLoadingFavorites || isLoadingMutes) {
    return <LoadingView />;
  }

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
