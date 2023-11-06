import React from 'react';
import {ScheduleItemCardBase} from './ScheduleItemCardBase';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {getDurationString} from '../../../libraries/DateTime';
import {useAppTheme} from '../../../styles/Theme';
import {EventType} from '../../../libraries/Enums/EventType';

export const EventCard = ({eventData}: {eventData: EventData}) => {
  const theme = useAppTheme();

  return (
    <ScheduleItemCardBase
      cardStyle={{
        backgroundColor:
          eventData.eventType === EventType.shadow ? theme.colors.jocoPurple : theme.colors.twitarrNeutralButton,
      }}
      title={eventData.title}
      duration={getDurationString(eventData.startTime, eventData.endTime, eventData.timeZone, true)}
    />
  );
};
