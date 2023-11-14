import {AppView} from '../../Views/AppView';
import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {RefreshControl, View} from 'react-native';
import {useEventFavoriteQuery} from '../../Queries/Events/EventQueries';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {EventCard} from '../../Cards/Schedule/EventCard';
import {LoadingView} from '../../Views/Static/LoadingView';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.eventFavoritesScreen,
  NavigatorIDs.eventStack
>;

export const EventFavoritesScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {data, isFetching, refetch} = useEventFavoriteQuery();

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        {data.map((eventData, i) => {
          return (
            <View key={i} style={[commonStyles.paddingVerticalSmall, commonStyles.paddingHorizontal]}>
              <EventCard
                eventData={eventData}
                showDay={true}
                onPress={() => navigation.push(EventStackComponents.eventScreen, {eventID: eventData.eventID})}
              />
            </View>
          );
        })}
      </ScrollingContentView>
    </AppView>
  );
};
