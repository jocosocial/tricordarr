import {AppView} from '../../Views/AppView';
import React, {useRef} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {RefreshControl, View} from 'react-native';
import {useEventFavoriteQuery} from '../../Queries/Events/EventQueries';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {EventCard} from '../../Cards/Schedule/EventCard';
import {LoadingView} from '../../Views/Static/LoadingView';
import {EventFlatList} from '../../Lists/Schedule/EventFlatList';
import {FlatList} from 'react-native-gesture-handler';
import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.eventFavoritesScreen,
  NavigatorIDs.eventStack
>;

export const EventFavoritesScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
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
