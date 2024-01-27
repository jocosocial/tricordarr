import React from 'react';
import {View} from 'react-native';
import {EventCard} from '../Schedule/EventCard';
import {useEventQuery} from '../../Queries/Events/EventQueries';
import {BottomTabComponents, EventStackComponents} from '../../../libraries/Enums/Navigation';
import {RootStackComponents, useRootStack} from '../../Navigation/Stacks/RootStackNavigator';

export const NextEventCard = ({eventID}: {eventID: string}) => {
  const {data} = useEventQuery({eventID: eventID});
  const rootStackNavigation = useRootStack();

  return (
    <View>
      {data && (
        <EventCard
          eventData={data}
          hideFavorite={true}
          showDay={true}
          onPress={() =>
            rootStackNavigation.push(RootStackComponents.rootContentScreen, {
              screen: BottomTabComponents.scheduleTab,
              params: {
                screen: EventStackComponents.eventScreen,
                params: {
                  eventID: eventID,
                },
                initial: false,
              },
            })
          }
          titleHeader={'Your next event:'}
        />
      )}
    </View>
  );
};
