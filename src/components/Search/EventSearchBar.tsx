import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Searchbar, Text} from 'react-native-paper';
import {ListSection} from '../Lists/ListSection';
import {useEventsQuery} from '../Queries/Events/EventQueries';
import {ScheduleEventCard} from '../Cards/Schedule/ScheduleEventCard';
import {eventToItem} from '../../libraries/DateTime';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ScheduleItem} from '../../libraries/Types';

interface EventSearchBarProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export const EventSearchBar = ({setIsLoading}: EventSearchBarProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const {setErrorMessage} = useErrorHandler();
  const {data, refetch, isFetching, isFetched} = useEventsQuery({
    search: searchQuery,
    options: {
      enabled: false,
    },
  });
  const {commonStyles} = useStyles();
  const [eventList, setEventList] = useState<ScheduleItem[]>([]);

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
    let itemList: ScheduleItem[] = [];
    if (data) {
      data.map(event => itemList.push(eventToItem(event)));
    }
    setEventList(itemList);
  }, [data]);

  useEffect(() => {
    setIsLoading(isFetching);
  }, [isFetching, setIsLoading]);

  return (
    <View>
      <Searchbar
        placeholder={'Search for events'}
        onIconPress={onSearch}
        onChangeText={onChangeSearch}
        value={searchQuery}
        onSubmitEditing={onSearch}
        onClearIconPress={onClear}
        style={[commonStyles.marginBottomSmall]}
      />
      <ListSection>
        {isFetched && eventList.length === 0 && (
          <View key={'noResults'} style={[commonStyles.paddingVerticalSmall]}>
            <Text>No Results</Text>
          </View>
        )}
        {eventList.map((item, i) => (
          <View key={i} style={[commonStyles.paddingVerticalSmall]}>
            <ScheduleEventCard item={item} includeDay={true} />
          </View>
        ))}
      </ListSection>
    </View>
  );
};
