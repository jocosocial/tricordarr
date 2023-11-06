import React, {useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {EventCard} from '../../Cards/Schedule/EventCard';
import {useEventQuery} from '../../Queries/Events/EventQueries';
import {RefreshControl} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScheduleStackParamList} from '../../Navigation/Stacks/ScheduleStackNavigator';
import {NavigatorIDs, ScheduleStackComponents} from '../../../libraries/Enums/Navigation';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.scheduleEventScreen,
  NavigatorIDs.scheduleStack
>;

export const ScheduleEventScreen = ({navigation, route}: Props) => {
  const {
    data: eventData,
    refetch,
    isFetching,
  } = useEventQuery({
    eventID: route.params.eventID,
  });

  useEffect(() => {
    if (eventData) {
      navigation.setOptions({
        headerTitle: eventData.title,
      });
    }
  }, [eventData, navigation]);

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <PaddedContentView>{eventData && <EventCard eventData={eventData} />}</PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
