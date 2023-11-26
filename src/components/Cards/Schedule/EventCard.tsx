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
import {ScheduleCardMarkerType} from '../../../libraries/Types';
import {ScheduleListActions} from '../../Reducers/Schedule/ScheduleListReducer';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useEventFavoriteQuery} from '../../Queries/Events/EventQueries';

interface EventCardProps {
  eventData: EventData;
  onPress?: () => void;
  showDay?: boolean;
  marker?: ScheduleCardMarkerType;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
  hideFavorite?: boolean;
  onLongPress?: () => void;
  titleHeader?: string;
}

export const EventCard = ({
  eventData,
  onPress,
  marker,
  setRefreshing,
  onLongPress,
  titleHeader,
  showDay = false,
  hideFavorite = false,
}: EventCardProps) => {
  const theme = useAppTheme();
  const eventFavoriteMutation = useEventFavoriteMutation();
  const {setInfoMessage} = useErrorHandler();
  const {dispatchScheduleList} = useTwitarr();
  const {refetchUserNotificationData} = useUserNotificationData();
  const {data: favoritesData, refetch: refetchFavorites} = useEventFavoriteQuery({enabled: false});

  const getFavorite = () => {
    if (eventData.isFavorite && !hideFavorite) {
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
          setInfoMessage(`${eventData.isFavorite ? 'Unfollowed' : 'Followed'} event ${eventData.title}`);
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
          // Update the user notification data in case this was/is a favorite.
          refetchUserNotificationData();
          // Update favorites
          if (favoritesData !== undefined) {
            refetchFavorites();
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
      onLongPress={onLongPress || handleToggleFavorite}
      marker={marker}
      titleHeader={titleHeader}
    />
  );
};
