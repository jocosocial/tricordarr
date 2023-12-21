import React from 'react';
import {AppView} from '../../../Views/AppView';
import {ForumPostSearchBar} from '../../../Search/ForumPostSearchBar';
import {useUserFavoritesQuery} from '../../../Queries/Users/UserFavoriteQueries';
import {LoadingView} from '../../../Views/Static/LoadingView';

export const ForumPostSearchScreen = () => {
  // This is used deep in the FlatList to star posts by favorite users.
  // Will trigger an initial load if the data is empty else a background refetch on staleTime.
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();

  if (isLoadingFavorites) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ForumPostSearchBar />
    </AppView>
  );
};
