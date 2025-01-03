import {AppView} from '../../Views/AppView.tsx';
import {BoardgameFlatList} from '../../Lists/BoardgameFlatList.tsx';
import {useBoardgamesQuery} from '../../Queries/Boardgames/BoardgameQueries.ts';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView.tsx';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import React from 'react';
import {useAuth} from '../../Context/Contexts/AuthContext.ts';
import {RefreshControl} from 'react-native';

export const BoardgameListScreen = () => {
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    refetch,
    isFetching,
  } = useBoardgamesQuery({});
  const {isLoggedIn} = useAuth();

  const handleLoadNext = async () => {
    if (!isFetchingNextPage && hasNextPage) {
      await fetchNextPage();
    }
  };

  const handleLoadPrevious = async () => {
    if (!isFetchingPreviousPage && hasPreviousPage) {
      await fetchPreviousPage();
    }
  };

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  const items = data?.pages.flatMap(p => p.gameArray) || [];

  return (
    <AppView>
      <BoardgameFlatList
        items={items}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      />
    </AppView>
  );
};
