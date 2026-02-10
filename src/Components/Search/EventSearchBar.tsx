import {type FlashListRef} from '@shopify/flash-list';
import React, {useRef, useState} from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
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
  const listRef = useRef<FlashListRef<EventData>>(null);

  const onChangeSearch = (query: string) => {
    if (query !== searchQuery) {
      setQueryEnable(false);
    }
    setSearchQuery(query);
  };

  const onSearch = () => {
    setQueryEnable(true);
  };

  // Only show results after user has performed a search; otherwise list stays empty
  // (avoids showing cached "all event days" from ScheduleDayScreen when query key matches).
  const eventList = queryEnable ? data || [] : [];

  return (
    <>
      <SearchBarBase searchQuery={searchQuery} onSearch={onSearch} onChangeSearch={onChangeSearch} />
      <ScheduleFlatList
        listRef={listRef}
        listFooter={<TimeDivider label={'End of Results'} />}
        items={eventList}
        refreshControl={<AppRefreshControl refreshing={isFetching} onRefresh={refetch} enabled={!!searchQuery} />}
        separator={'day'}
      />
    </>
  );
};
