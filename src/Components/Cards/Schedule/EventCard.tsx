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

  const styles = StyleSheet.create({
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  });

  const needsPhotographerIcon = useMemo(() => {
    if (!hasShutternaut || !eventData.shutternautData?.needsPhotographer) {
      return null;
    }
    return <AppIcon icon={AppIcons.needsPhotographer} color={theme.colors.onTwitarrNegativeButton} />;
  }, [hasShutternaut, eventData.shutternautData?.needsPhotographer, theme.colors.onTwitarrNegativeButton]);

  const photographerIcon = useMemo(() => {
    if (!hasShutternaut || !eventData.shutternautData?.userIsPhotographer) {
      return null;
    }
    return <AppIcon icon={AppIcons.shutternaut} color={theme.colors.onTwitarrNegativeButton} />;
  }, [hasShutternaut, eventData.shutternautData?.userIsPhotographer, theme.colors.onTwitarrNegativeButton]);

  const favoriteIcon = useMemo(() => {
    return (
      <TouchableOpacity onPress={onFavoritePress}>
        {eventData.isFavorite ? (
          <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />
        ) : (
          <AppIcon icon={AppIcons.toggleFavorite} />
        )}
      </TouchableOpacity>
    );
  }, [onFavoritePress, eventData.isFavorite, theme.colors.twitarrYellow]);

  return (
    <View style={styles.iconContainer}>
      {refreshing && <ActivityIndicator />}
      {!refreshing && (
        <>
          {needsPhotographerIcon}
          {photographerIcon}
          {favoriteIcon}
        </>
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
