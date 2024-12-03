import React, {useEffect, useRef, useState} from 'react';
import {RefreshControl} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {useEventsQuery} from '../Queries/Events/EventQueries.ts';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../Context/Contexts/StyleContext';
import {EventData} from '../../libraries/Structs/ControllerStructs';
import {TimeDivider} from '../Lists/Dividers/TimeDivider';
import {getDayMarker} from '../../libraries/DateTime';
import {ScheduleFlatList} from '../Lists/Schedule/ScheduleFlatList.tsx';
import {FlashList} from '@shopify/flash-list';

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
  const {commonStyles} = useStyles();
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

  // Clear search results when you go back or otherwise unmount this screen.
  useEffect(() => {
    return () => remove();
  }, [remove]);

  // Deal with some undefined issues below by defaulting to empty list.
  const eventList = data || [];

  return (
    <ScheduleFlatList
      listRef={listRef}
      listFooter={<TimeDivider label={'End of Results'} />}
      listHeader={
        <>
          <Searchbar
            placeholder={'Search for events'}
            onIconPress={onSearch}
            onChangeText={onChangeSearch}
            value={searchQuery}
            onSubmitEditing={onSearch}
            onClearIconPress={onClear}
            style={[commonStyles.marginVerticalSmall]}
          />
          {eventList.length > 0 && (
            <TimeDivider label={getDayMarker(eventList[0].startTime, eventList[0].timeZoneID)} />
          )}
        </>
      }
      items={eventList}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} enabled={!!searchQuery} />}
      separator={'day'}
    />
  );
};
