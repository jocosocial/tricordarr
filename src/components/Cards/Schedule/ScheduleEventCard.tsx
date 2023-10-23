import React from 'react';
import {Card} from 'react-native-paper';
import {EventData} from '../../../libraries/Structs/ControllerStructs';

interface ScheduleEventCardProps {
  event: EventData;
}

export const ScheduleEventCard = ({event}: ScheduleEventCardProps) => {
  return (
    <Card>
      <Card.Title title={event.title} />
      {/*<Card.Content>*/}
      {/*  <Text>*/}
      {/*    We'll be holding events specifically designed to make our first-time JoCo Cruisers feel welcome and to help*/}
      {/*    them ease into the swing of things. Make a particular effort on this day to seek out new attendees and help*/}
      {/*    show them what a great decision they've made by joining us!*/}
      {/*  </Text>*/}
      {/*</Card.Content>*/}
    </Card>
  );
};
