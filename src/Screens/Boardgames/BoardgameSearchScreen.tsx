import React from 'react';
import {RefreshControl} from 'react-native';

import {BoardgameFlatList} from '#src/Components/Lists/Boardgames/BoardgameFlatList';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useBoardgamesQuery} from '#src/Queries/Boardgames/BoardgameQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

export const BoardgameSearchScreen = () => {
  return (
    <PreRegistrationScreen>
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

  return (
    <AppView>
      <SearchBarBase
        searchQuery={searchQuery}
        onClear={onClear}
        onSearch={onSearch}
        onChangeSearch={query => setSearchQuery(query)}
        style={commonStyles.marginBottom}
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
