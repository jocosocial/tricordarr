import React, {useEffect, useRef, useState} from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {useEventsQuery} from '../Queries/Events/EventQueries';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../Context/Contexts/StyleContext';
import {EventData, FezData} from '../../libraries/Structs/ControllerStructs';
import {EventFlatList} from '../Lists/Schedule/EventFlatList';
import {TimeDivider} from '../Lists/Dividers/TimeDivider';
import {getDayMarker} from '../../libraries/DateTime';

export const EventSearchBar = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const {setErrorMessage} = useErrorHandler();
  const {data, refetch, isFetching} = useEventsQuery({
    search: searchQuery,
    options: {
      enabled: false,
    },
  });
  const {commonStyles} = useStyles();
  const [eventList, setEventList] = useState<EventData[]>([]);
  const listRef = useRef<FlatList<EventData | FezData>>(null);

  const onChangeSearch = (query: string) => setSearchQuery(query);
  const onClear = () => setEventList([]);

  const onSearch = () => {
    if (!searchQuery || searchQuery.length < 3) {
      setErrorMessage('Search string must be >2 characters');
    } else {
      refetch();
    }
  };

  useEffect(() => {
    if (data) {
      setEventList(data);
    }
  }, [data]);

  return (
    <EventFlatList
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
          {eventList.length > 0 && <TimeDivider label={getDayMarker(eventList[0].startTime, eventList[0].timeZone)} />}
        </>
      }
      scheduleItems={eventList}
      listRef={listRef}
      scrollNowIndex={0}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} enabled={!!searchQuery} />}
      separator={'day'}
    />
  );
};
