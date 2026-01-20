import React from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {BoardgameFlatList} from '#src/Components/Lists/Boardgames/BoardgameFlatList';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useSafePagination} from '#src/Hooks/useSafePagination';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useBoardgamesQuery} from '#src/Queries/Boardgames/BoardgameQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

export const BoardgameSearchScreen = () => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.boardgameHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.gameslist} urlPath={'/boardgames'}>
        <BoardgameSearchScreenInner />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const BoardgameSearchScreenInner = () => {
  const {commonStyles} = useStyles();
  const [queryEnable, setQueryEnable] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const {data, hasNextPage, fetchNextPage, isFetching, refetch} = useBoardgamesQuery({
    search: searchQuery,
    options: {
      enabled: queryEnable,
    },
  });

  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: refetch,
    isRefreshing: isFetching,
  });

  const onSearch = () => {
    setQueryEnable(true);
    setRefreshing(true);
  };

  const onClear = () => {
    setSearchQuery('');
    // remove() was deprecated in react-query v5. Do we still need to do that?
  };

  const onChangeSearch = (query: string) => {
    if (query !== searchQuery) {
      setQueryEnable(false);
    }
    setSearchQuery(query);
  };

  const items = searchQuery ? data?.pages.flatMap(p => p.gameArray) || [] : [];

  const {safeHandleLoadNext, effectiveHasNextPage} = useSafePagination({
    searchQuery,
    minLength: 3,
    hasNextPage: hasNextPage ?? false,
    itemsLength: items.length,
    fetchNextPage,
  });

  return (
    <AppView>
      <SearchBarBase
        searchQuery={searchQuery}
        onClear={onClear}
        onSearch={onSearch}
        onChangeSearch={onChangeSearch}
        style={commonStyles.marginBottom}
      />
      <BoardgameFlatList
        items={items}
        hasNextPage={effectiveHasNextPage}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={!!searchQuery} />}
        handleLoadNext={safeHandleLoadNext}
      />
    </AppView>
  );
};
