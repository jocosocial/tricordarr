import React, {useRef, useState} from 'react';
import {RefreshControl} from 'react-native';
import {useEventsQuery} from '../Queries/Events/EventQueries.ts';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {EventData} from '../../libraries/Structs/ControllerStructs';
import {TimeDivider} from '../Lists/Dividers/TimeDivider';
import {ScheduleFlatList} from '../Lists/Schedule/ScheduleFlatList.tsx';
import {FlashList} from '@shopify/flash-list';
import {SearchBarBase} from './SearchBarBase.tsx';

export const EventSearchBar = () => {
  const [queryEnable, setQueryEnable] = useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const {setErrorMessage} = useErrorHandler();
  const {data, refetch, isFetching, remove} = useEventsQuery({
    search: searchQuery,
    options: {
      enabled: queryEnable,
    },
  });
  const listRef = useRef<FlashList<EventData>>(null);

  const onChangeSearch = (query: string) => {
    if (query !== searchQuery) {
      setQueryEnable(false);
      remove();
    }
    setSearchQuery(query);
  };
  const onClear = () => remove();

  const onSearch = () => {
    if (!searchQuery || searchQuery.length < 3) {
      setErrorMessage('Search string must be >2 characters');
      setQueryEnable(false);
    } else {
      setQueryEnable(true);
    }
  };

  // Deal with some undefined issues below by defaulting to empty list.
  const eventList = data || [];

  return (
    <>
      <SearchBarBase
        searchQuery={searchQuery}
        onSearch={onSearch}
        onChangeSearch={onChangeSearch}
        onClear={onClear}
        remove={remove}
      />
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
