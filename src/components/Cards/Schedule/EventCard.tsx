import React from 'react';
import {ScheduleItemCardBase} from './ScheduleItemCardBase';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useAppTheme} from '../../../styles/Theme';
import {EventType} from '../../../libraries/Enums/EventType';
import {AppIcon} from '../../Images/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';

interface EventCardProps {
  eventData: EventData;
  onPress?: () => void;
  showDay?: boolean;
}

export const EventCard = ({eventData, onPress, showDay = false}: EventCardProps) => {
  const theme = useAppTheme();

  const getFavorite = () => {
    if (eventData.isFavorite) {
      return <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />;
    }
  };

  return (
    <ScheduleItemCardBase
      onPress={onPress}
      cardStyle={{
        backgroundColor:
          eventData.eventType === EventType.shadow ? theme.colors.jocoPurple : theme.colors.twitarrNeutralButton,
      }}
      title={eventData.title}
      location={eventData.location}
      titleRight={getFavorite}
      startTime={eventData.startTime}
      endTime={eventData.endTime}
      timeZone={eventData.timeZone}
      showDay={showDay}
    />
  );
};
