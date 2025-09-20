import React from 'react';
import {View} from 'react-native';
import {EventCard} from '../Schedule/EventCard.tsx';
import {useEventQuery} from '../../Queries/Events/EventQueries.ts';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';

export const NextEventCard = ({eventID}: {eventID: string}) => {
  const {data} = useEventQuery({eventID: eventID});
  const commonNavigation = useCommonStack();

  return (
    <View>
      {data && (
        <EventCard
          eventData={data}
          hideFavorite={true}
          showDay={true}
          onPress={() => commonNavigation.push(CommonStackComponents.eventScreen, {eventID: eventID})}
          titleHeader={'Your next event:'}
        />
      )}
    </View>
  );
};
