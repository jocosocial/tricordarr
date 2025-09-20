import React, {useCallback, useState} from 'react';
import {ScheduleItemCardBase} from './ScheduleItemCardBase.tsx';
import {EventData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {useAppTheme} from '#src/Styles/Theme.ts';
import {EventType} from '#src/Libraries/Enums/EventType.ts';
import {AppIcon} from '#src/Components/Icons/AppIcon.tsx';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {ScheduleCardMarkerType} from '#src/Libraries/Types/index.ts';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {useEventFavoriteMutation} from '#src/Components/Queries/Events/EventFavoriteMutations.ts';
import {useQueryClient} from '@tanstack/react-query';
import {ActivityIndicator} from 'react-native-paper';

interface EventCardProps {
  eventData: EventData;
  onPress?: () => void;
  showDay?: boolean;
  marker?: ScheduleCardMarkerType;
  hideFavorite?: boolean;
  onLongPress?: () => void;
  titleHeader?: string;
}

export const EventCard = ({
  eventData,
  onPress,
  marker,
  onLongPress,
  titleHeader,
  showDay = false,
  hideFavorite = false,
}: EventCardProps) => {
  const theme = useAppTheme();
  const eventFavoriteMutation = useEventFavoriteMutation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onFavoritePress = useCallback(() => {
    setRefreshing(true);
    eventFavoriteMutation.mutate(
      {
        eventID: eventData.eventID,
        action: eventData.isFavorite ? 'unfavorite' : 'favorite',
      },
      {
        onSuccess: async () => {
          // If this is too slow to reload, a setQueryData here may be in order.
          await Promise.all([
            queryClient.invalidateQueries(['/events']),
            queryClient.invalidateQueries([`/events/${eventData.eventID}`]),
            queryClient.invalidateQueries(['/events/favorites']),
            // Update the user notification data in case this was/is a favorite.
            queryClient.invalidateQueries(['/notification/global']),
          ]);
        },
        onSettled: () => setRefreshing(false),
      },
    );
  }, [eventData.eventID, eventData.isFavorite, eventFavoriteMutation, queryClient]);

  const getFavorite = useCallback(() => {
    if (refreshing) {
      return <ActivityIndicator />;
    }
    if (eventData.isFavorite && !hideFavorite) {
      return (
        <TouchableOpacity onPress={onFavoritePress}>
          <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />
        </TouchableOpacity>
      );
    } else if (!hideFavorite) {
      return (
        <TouchableOpacity onPress={onFavoritePress}>
          <AppIcon icon={AppIcons.toggleFavorite} />
        </TouchableOpacity>
      );
    }
  }, [eventData.isFavorite, hideFavorite, onFavoritePress, refreshing, theme.colors.twitarrYellow]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor:
        eventData.eventType === EventType.shadow ? theme.colors.jocoPurple : theme.colors.twitarrNeutralButton,
    },
  });

  return (
    <ScheduleItemCardBase
      onPress={onPress}
      cardStyle={styles.card}
      title={eventData.title}
      location={eventData.location}
      titleRight={getFavorite}
      startTime={eventData.startTime}
      endTime={eventData.endTime}
      timeZoneID={eventData.timeZoneID}
      showDay={showDay}
      onLongPress={onLongPress}
      marker={marker}
      titleHeader={titleHeader}
    />
  );
};
