import {AppView} from '../../Views/AppView';
import React, {useRef} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {RefreshControl} from 'react-native';
import {useEventFavoriteQuery} from '../../Queries/Events/EventQueries';
import {LoadingView} from '../../Views/Static/LoadingView';
import {EventFlatList} from '../../Lists/Schedule/EventFlatList';
import {FlatList} from 'react-native-gesture-handler';
import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.eventFavoritesScreen,
  NavigatorIDs.eventStack
>;

export const EventFavoritesScreen = () => {
  const {data, isFetching, refetch} = useEventFavoriteQuery();
  const listRef = useRef<FlatList<EventData | FezData>>(null);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <EventFlatList
        scheduleItems={data}
        listRef={listRef}
        scrollNowIndex={0}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        separateByDay={true}
      />
    </AppView>
  );
};
