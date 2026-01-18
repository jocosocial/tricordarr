import React from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {BoardgameFlatList} from '#src/Components/Lists/Boardgames/BoardgameFlatList';
import {SearchBarBase, useSafePagination} from '#src/Components/Search/SearchBarBase';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
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
  const [searchQuery, setSearchQuery] = React.useState('');
  const {data, hasNextPage, fetchNextPage, isFetching, refetch} = useBoardgamesQuery({
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
    // remove() was deprecated in react-query v5. Do we still need to do that?
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
        onChangeSearch={query => {
          setSearchQuery(query);
        }}
        style={commonStyles.marginBottom}
      />
      <BoardgameFlatList
        items={items}
        hasNextPage={effectiveHasNextPage}
        refreshControl={<AppRefreshControl refreshing={isFetching} enabled={false} />}
        handleLoadNext={safeHandleLoadNext}
      />
    </AppView>
  );
};
