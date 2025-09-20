import React from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {ForumPostSearchBar} from '#src/Search/ForumPostSearchBar.tsx';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries.ts';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ListTitleView} from '#src/Views/ListTitleView.tsx';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens.tsx';

export type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumPostSearchScreen>;

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
