import React from 'react';
import {ScheduleItemCardBase} from './ScheduleItemCardBase';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useAppTheme} from '../../../styles/Theme';
import {EventType} from '../../../libraries/Enums/EventType';
import {AppIcon} from '../../Images/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useEventFavoriteMutation} from '../../Queries/Events/EventFavoriteQueries';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

interface EventCardProps {
  eventData: EventData;
  onPress?: () => void;
  showDay?: boolean;
}

export const EventCard = ({eventData, onPress, showDay = false}: EventCardProps) => {
  const theme = useAppTheme();
  const eventFavoriteMutation = useEventFavoriteMutation();
  const {setErrorMessage} = useErrorHandler();

  const getFavorite = () => {
    if (eventData.isFavorite) {
      return <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />;
    }
  };

  const handleToggleFavorite = () => {
    eventFavoriteMutation.mutate(
      {
        eventID: eventData.eventID,
        action: eventData.isFavorite ? 'unfavorite' : 'favorite',
      },
      {
        onSuccess: () => {
          setErrorMessage(`${eventData.isFavorite ? 'Unfollowed' : 'Followed'} event ${eventData.title}`);
          console.log('@TODO update the local data');
        },
      },
    );
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
      onLongPress={handleToggleFavorite}
    />
  );
};
