import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {EventData, UserHeader} from '../../libraries/Structs/ControllerStructs';
import {ListSection} from '../Lists/ListSection';
import {UserListItem} from '../Lists/Items/UserListItem';
import {useUserMatchQuery} from '../Queries/Users/UserMatchQueries';
import {useEventsQuery} from '../Queries/Events/EventQueries';
import {ScheduleEventCard} from '../Cards/Schedule/ScheduleEventCard';
import {eventToItem} from '../../libraries/DateTime';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ScheduleItem} from '../../libraries/Types';

export const EventSearchBar = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const {setErrorMessage} = useErrorHandler();
  const {data, refetch} = useEventsQuery({
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
        {eventList.map((item, i) => (
          <View key={i} style={[commonStyles.paddingVerticalSmall]}>
            <ScheduleEventCard item={item} includeDay={true} />
          </View>
        ))}
      </ListSection>
    </View>
  );
};
