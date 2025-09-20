import React from 'react';
import {View} from 'react-native';
import {EventCard} from '#src/Components/Cards/Schedule/EventCard';
import {useEventQuery} from '#src/Queries/Events/EventQueries';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

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
