import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {ForumPostSearchBar} from '#src/Components/Search/ForumPostSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';

export type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.forumPostSearchScreen>;

export const ForumPostSearchScreen = ({route}: Props) => {
  // This is used deep in the FlatList to star posts by favorite users.
  // Will trigger an initial load if the data is empty else a background refetch on staleTime.
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();

  if (isLoadingFavorites) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {route.params.category && <ListTitleView title={route.params.category.title} />}
      {route.params.forum && <ListTitleView title={route.params.forum.title} />}
      <ForumPostSearchBar category={route.params.category} forum={route.params.forum} />
    </AppView>
  );
};
