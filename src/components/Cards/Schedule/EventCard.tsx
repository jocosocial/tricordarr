import React, {Dispatch, SetStateAction} from 'react';
import {ScheduleItemCardBase} from './ScheduleItemCardBase';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useAppTheme} from '../../../styles/Theme';
import {EventType} from '../../../libraries/Enums/EventType';
import {AppIcon} from '../../Images/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useEventFavoriteMutation} from '../../Queries/Events/EventFavoriteQueries';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {EventListActions} from '../../Reducers/Schedule/EventListReducer';
import {ScheduleCardMarkerType} from '../../../libraries/Types';
import {ScheduleListActions} from '../../Reducers/Schedule/ScheduleListReducer';

interface EventCardProps {
  eventData: EventData;
  onPress?: () => void;
  showDay?: boolean;
  marker?: ScheduleCardMarkerType;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

export const EventCard = ({eventData, onPress, marker, setRefreshing, showDay = false}: EventCardProps) => {
  const theme = useAppTheme();
  const eventFavoriteMutation = useEventFavoriteMutation();
  const {setErrorMessage} = useErrorHandler();
  const {dispatchScheduleList} = useTwitarr();

  const getFavorite = () => {
    if (eventData.isFavorite) {
      return <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />;
    }
  };

  const handleToggleFavorite = () => {
    if (setRefreshing) {
      setRefreshing(true);
    }
    eventFavoriteMutation.mutate(
      {
        eventID: eventData.eventID,
        action: eventData.isFavorite ? 'unfavorite' : 'favorite',
      },
      {
        onSuccess: () => {
          setErrorMessage(`${eventData.isFavorite ? 'Unfollowed' : 'Followed'} event ${eventData.title}`);
          dispatchScheduleList({
            type: ScheduleListActions.updateEvent,
            newEvent: {
              ...eventData,
              isFavorite: !eventData.isFavorite,
            },
          });
          if (setRefreshing) {
            setRefreshing(false);
          }
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
      marker={marker}
    />
  );
};
