import {FlashList} from '@shopify/flash-list';
import React, {useRef, useState} from 'react';
import {RefreshControl} from 'react-native';

import {TimeDivider} from '#src/Components/Lists/Dividers/TimeDivider';
import {ScheduleFlatList} from '#src/Components/Lists/Schedule/ScheduleFlatList';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {useEventsQuery} from '#src/Queries/Events/EventQueries';
import {EventData} from '#src/Structs/ControllerStructs';

export const EventSearchBar = () => {
  const [queryEnable, setQueryEnable] = useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const {data, refetch, isFetching} = useEventsQuery({
    search: searchQuery,
    options: {
      enabled: queryEnable,
    },
  });
  const listRef = useRef<FlashList<EventData>>(null);

  const onChangeSearch = (query: string) => {
    if (query !== searchQuery) {
      setQueryEnable(false);
    }
    setSearchQuery(query);
  };

  const onSearch = () => {
    setQueryEnable(true);
  };

  // Deal with some undefined issues below by defaulting to empty list.
  const eventList = data || [];

  return (
    <>
      <SearchBarBase searchQuery={searchQuery} onSearch={onSearch} onChangeSearch={onChangeSearch} />
      <ScheduleFlatList
        listRef={listRef}
        listFooter={<TimeDivider label={'End of Results'} />}
        items={eventList}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} enabled={!!searchQuery} />}
        separator={'day'}
      />
    </>
  );
};
