import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {ScheduleItemCardBase} from '#src/Components/Cards/Schedule/ScheduleItemCardBase';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {EventType} from '#src/Enums/EventType';
import {AppIcons} from '#src/Enums/Icons';
import {useEventFavoriteMutation} from '#src/Queries/Events/EventFavoriteMutations';
import {EventData, UserNotificationData} from '#src/Structs/ControllerStructs';
import {ScheduleCardMarkerType} from '#src/Types';

interface EventCardProps {
  eventData: EventData;
  onPress?: () => void;
  showDay?: boolean;
  marker?: ScheduleCardMarkerType;
  hideFavorite?: boolean;
  onLongPress?: () => void;
  titleHeader?: string;
}

interface EventCardRightIconsProps {
  eventData: EventData;
  refreshing: boolean;
  onFavoritePress: () => void;
}

const EventCardRightIcons = ({eventData, refreshing, onFavoritePress}: EventCardRightIconsProps) => {
  const {theme} = useAppTheme();
  const {hasShutternaut} = useRoles();

  const iconContainerStyle = useMemo(
    () =>
      StyleSheet.create({
        iconContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
      }),
    [],
  );

  if (refreshing) {
    return <ActivityIndicator />;
  }

  const showNeedsPhotographer = hasShutternaut && eventData.shutternautData?.needsPhotographer;
  const showPhotographer = hasShutternaut && eventData.shutternautData?.userIsPhotographer;
  const showFavorite = true;

  if (!showNeedsPhotographer && !showPhotographer && !showFavorite) {
    return null;
  }

  // If only one icon, render without wrapper to avoid layout issues
  if (showFavorite && !showPhotographer && !showNeedsPhotographer) {
    return (
      <TouchableOpacity onPress={onFavoritePress}>
        {eventData.isFavorite ? (
          <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />
        ) : (
          <AppIcon icon={AppIcons.toggleFavorite} />
        )}
      </TouchableOpacity>
    );
  }

  if (showPhotographer && !showFavorite && !showNeedsPhotographer) {
    return <AppIcon icon={AppIcons.shutternaut} color={theme.colors.onTwitarrNegativeButton} />;
  }

  if (showNeedsPhotographer && !showPhotographer && !showFavorite) {
    return <AppIcon icon={AppIcons.needsPhotographer} color={theme.colors.onTwitarrNegativeButton} />;
  }

  // Multiple icons present - use wrapper with row layout
  return (
    <View style={iconContainerStyle.iconContainer}>
      {showNeedsPhotographer && (
        <AppIcon icon={AppIcons.needsPhotographer} color={theme.colors.onTwitarrNegativeButton} />
      )}
      {showPhotographer && <AppIcon icon={AppIcons.shutternaut} color={theme.colors.onTwitarrNegativeButton} />}
      {showFavorite && (
        <TouchableOpacity onPress={onFavoritePress}>
          {eventData.isFavorite ? (
            <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />
          ) : (
            <AppIcon icon={AppIcons.toggleFavorite} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export const EventCard = ({
  eventData,
  onPress,
  marker,
  onLongPress,
  titleHeader,
  showDay = false,
  hideFavorite = false,
}: EventCardProps) => {
  const {theme} = useAppTheme();
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
          const invalidations = UserNotificationData.getCacheKeys()
            .concat([['/events'], [`/events/${eventData.eventID}`], ['/events/favorites']])
            .map(key => queryClient.invalidateQueries({queryKey: key}));
          await Promise.all(invalidations);
        },
        onSettled: () => setRefreshing(false),
      },
    );
  }, [eventData.eventID, eventData.isFavorite, eventFavoriteMutation, queryClient]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor:
            eventData.eventType === EventType.shadow ? theme.colors.jocoPurple : theme.colors.twitarrNeutralButton,
        },
      }),
    [eventData.eventType, theme.colors.jocoPurple, theme.colors.twitarrNeutralButton],
  );

  const getRight = useCallback(() => {
    if (hideFavorite) {
      return null;
    }
    return <EventCardRightIcons eventData={eventData} refreshing={refreshing} onFavoritePress={onFavoritePress} />;
  }, [eventData, refreshing, hideFavorite, onFavoritePress]);

  return (
    <ScheduleItemCardBase
      onPress={onPress}
      cardStyle={styles.card}
      title={eventData.title}
      location={eventData.location}
      titleRight={getRight}
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
