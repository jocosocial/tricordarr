import {AppView} from '../../Views/AppView';
import React, {useRef} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {FlatList, RefreshControl} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {EventFlatList} from '../../Lists/Schedule/EventFlatList';
import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';
import {useEventFavoritesQuery} from '../../Queries/Events/EventFavoriteQueries';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.eventFavoritesScreen,
  NavigatorIDs.eventStack
>;

export const EventFavoritesScreen = () => {
  const {data, isFetching, refetch} = useEventFavoritesQuery();
  const listRef = useRef<FlatList<EventData | FezData>>(null);

  if (isFetching) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <EventFlatList
        scheduleItems={data || []}
        listRef={listRef}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        separator={'day'}
      />
    </AppView>
  );
};
