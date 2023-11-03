import React from 'react';
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

  const onChangeSearch = (query: string) => {
    console.log('Evnet search', query);
    setSearchQuery(query);
  };

  const handleSearch = () => {
    if (!searchQuery || searchQuery.length < 3) {
      setErrorMessage('Search string must be >2 characters');
    } else {
      refetch();
    }
  };

  return (
    <View>
      <Searchbar
        placeholder={'Search for events'}
        onIconPress={handleSearch}
        onChangeText={onChangeSearch}
        value={searchQuery}
        onSubmitEditing={handleSearch}
      />
      <ListSection>
        {data &&
          data.flatMap(event => (
            <View key={event.eventID} style={[commonStyles.paddingVerticalSmall]}>
              <ScheduleEventCard item={eventToItem(event)} />
            </View>
          ))}
      </ListSection>
    </View>
  );
};
