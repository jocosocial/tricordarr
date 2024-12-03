import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useUserProfileQuery} from '../../Queries/Users/UserProfileQueries.ts';
import {UserProfileScreenBase} from './UserProfileScreenBase';
import {useUserMutesQuery} from '../../Queries/Users/UserMuteQueries.ts';
import {useUserBlocksQuery} from '../../Queries/Users/UserBlockQueries.ts';
import {useUserFavoritesQuery} from '../../Queries/Users/UserFavoriteQueries.ts';
import {LoadingView} from '../../Views/Static/LoadingView';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.userProfileScreen>;

export const UserProfileScreen = ({route}: Props) => {
  const {data, refetch, isLoading} = useUserProfileQuery(route.params.userID);

  // Moved these out of the UserRelationsProvider so that they wouldn't get refetched on app startup.
  // isLoading means that there is no data in the cache. They'll auto refetch (enabled is implicitly true here)
  // in the background after staleTime or on app reload when we hit this screen.
  const {isLoading: isLoadingBlocks} = useUserBlocksQuery();
  const {isLoading: isLoadingMutes} = useUserMutesQuery();
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();

  if (isLoadingBlocks || isLoadingFavorites || isLoadingMutes) {
    return <LoadingView />;
  }

  return <UserProfileScreenBase data={data} refetch={refetch} isLoading={isLoading} />;
};
