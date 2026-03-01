import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {ScheduleItemCardBase} from '#src/Components/Cards/Schedule/ScheduleItemCardBase';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useEventFavoriteMutation} from '#src/Queries/Events/EventFavoriteMutations';
import {EventData, UserNotificationData} from '#src/Structs/ControllerStructs';
import {ScheduleCardMarkerType} from '#src/Types';
import {DayPlannerItem} from '#src/Types/DayPlanner';

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
  /** When set (e.g. gold team), favorite icons use this color for contrast. */
  contentColor?: string;
}

const EventCardRightIcons = ({eventData, refreshing, onFavoritePress, contentColor}: EventCardRightIconsProps) => {
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

  const favoriteIconColor = contentColor ?? theme.colors.twitarrYellow;
  const favoriteIcon = useMemo(() => {
    return (
      <TouchableOpacity onPress={onFavoritePress}>
        {eventData.isFavorite ? (
          <AppIcon icon={AppIcons.favorite} color={favoriteIconColor} />
        ) : (
          <AppIcon icon={AppIcons.toggleFavorite} color={favoriteIconColor} />
        )}
      </TouchableOpacity>
    );
  }, [onFavoritePress, eventData.isFavorite, favoriteIconColor]);

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
            .concat(EventData.getCacheKeys(eventData.eventID))
            .map(key => queryClient.invalidateQueries({queryKey: key}));
          await Promise.all(invalidations);
        },
        onSettled: () => setRefreshing(false),
      },
    );
  }, [eventData.eventID, eventData.isFavorite, eventFavoriteMutation, queryClient]);

  const cardStyleAndContentColor = useMemo(() => {
    const color = DayPlannerItem.getDayPlannerColor({
      type: 'event',
      title: eventData.title,
      eventType: eventData.eventType,
    });
    const backgroundColor = DayPlannerItem.getBackgroundColor(color, theme.colors);
    const contentColor = DayPlannerItem.getTextColor(color, theme.colors);
    const showMarkerBorder = color === 'goldTeam';
    return {
      cardStyle: StyleSheet.create({card: {backgroundColor}}).card,
      contentColor,
      showMarkerBorder,
    };
  }, [eventData.title, eventData.eventType, theme.colors]);

  const getRight = useCallback(() => {
    if (hideFavorite) {
      return null;
    }
    return (
      <EventCardRightIcons
        eventData={eventData}
        refreshing={refreshing}
        onFavoritePress={onFavoritePress}
        contentColor={cardStyleAndContentColor.contentColor}
      />
    );
  }, [eventData, refreshing, hideFavorite, onFavoritePress, cardStyleAndContentColor.contentColor]);

  return (
    <ScheduleItemCardBase
      onPress={onPress}
      cardStyle={cardStyleAndContentColor.cardStyle}
      contentColor={cardStyleAndContentColor.contentColor}
      showMarkerBorder={cardStyleAndContentColor.showMarkerBorder}
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
