import React from 'react';
import {AppView} from '../../../Views/AppView';
import {ForumPostSearchBar} from '../../../Search/ForumPostSearchBar';
import {useUserFavoritesQuery} from '../../../Queries/Users/UserFavoriteQueries';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ListTitleView} from '../../../Views/ListTitleView.tsx';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens.tsx';

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
