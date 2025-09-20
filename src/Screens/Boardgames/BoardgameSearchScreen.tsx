import {AppView} from '#src/Views/AppView.tsx';
import React, {useEffect} from 'react';
import {SearchBarBase} from '#src/Search/SearchBarBase.tsx';
import {useBoardgamesQuery} from '#src/Queries/Boardgames/BoardgameQueries.ts';
import {BoardgameFlatList} from '#src/Lists/BoardgameFlatList.tsx';
import {RefreshControl} from 'react-native';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';

export const BoardgameSearchScreen = () => {
  const {commonStyles} = useStyles();
  const [searchQuery, setSearchQuery] = React.useState('');
  const {data, hasNextPage, fetchNextPage, isFetching, refetch, remove} = useBoardgamesQuery({
    search: searchQuery,
    options: {
      enabled: false,
    },
  });

  const onSearch = async () => {
    await refetch();
  };

  const onClear = () => {
    setSearchQuery('');
    remove();
  };

  const items = searchQuery ? data?.pages.flatMap(p => p.gameArray) || [] : [];

  return (
    <AppView>
      <SearchBarBase
        searchQuery={searchQuery}
        onClear={onClear}
        onSearch={onSearch}
        onChangeSearch={query => setSearchQuery(query)}
        style={commonStyles.marginBottom}
        remove={remove}
      />
      <BoardgameFlatList
        items={items}
        hasNextPage={items.length > 0 && hasNextPage}
        refreshControl={<RefreshControl refreshing={isFetching} enabled={false} />}
        handleLoadNext={fetchNextPage}
      />
    </AppView>
  );
};
