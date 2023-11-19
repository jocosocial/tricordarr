import React from 'react';
import {View} from 'react-native';
import {EventCard} from '../Schedule/EventCard';
import {useEventQuery} from '../../Queries/Events/EventQueries';
import {useBottomTabNavigator} from '../../Navigation/Tabs/BottomTabNavigator';
import {BottomTabComponents, EventStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';

export const NextEventCard = ({eventID}: {eventID: string}) => {
  const {data} = useEventQuery({eventID: eventID});
  const bottomNav = useBottomTabNavigator();
  const rootStackNavigation = useRootStack();

  return (
    <View>
      {data && (
        <EventCard
          eventData={data}
          hideFavorite={true}
          showDay={true}
          onPress={
            () =>
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
            // bottomNav.navigate(BottomTabComponents.scheduleTab, {
            //   // https://github.com/react-navigation/react-navigation/issues/7698
            //   initial: false,
            //   screen: EventStackComponents.eventScreen,
            //   params: {
            //     eventID: eventID,
            //   },
            // })
          }
          titleHeader={'Your next event:'}
        />
      )}
    </View>
  );
};
