import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Searchbar, Text} from 'react-native-paper';
import {ListSection} from '../Lists/ListSection';
import {useEventsQuery} from '../Queries/Events/EventQueries';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../Context/Contexts/StyleContext';
import {EventData} from '../../libraries/Structs/ControllerStructs';
import {EventCard} from '../Cards/Schedule/EventCard';
import {useEventStackNavigation} from '../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents} from '../../libraries/Enums/Navigation';

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
  const [eventList, setEventList] = useState<EventData[]>([]);
  const navigation = useEventStackNavigation();

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
            <EventCard
              eventData={item}
              showDay={true}
              onPress={() => navigation.push(EventStackComponents.eventScreen, {eventID: item.eventID})}
            />
          </View>
        ))}
      </ListSection>
    </View>
  );
};
