import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {ScheduleItemCardBase} from '#src/Components/Cards/Schedule/ScheduleItemCardBase';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
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
  onFavorite?: () => void;
}

interface EventCardRightIconsProps {
  eventData: EventData;
  refreshing: boolean;
  onFavoritePress: () => void;
  /** When set (e.g. gold team), favorite icons use this color for contrast. */
  contentColor?: string;
}

/**
 * Right-side icons for an event card (photographer markers and favorite toggle).
 * The favorite control uses a min layout hit target so taps are not stolen by the parent card press.
 */
const EventCardRightIcons = ({eventData, refreshing, onFavoritePress, contentColor}: EventCardRightIconsProps) => {
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();
  const {hasShutternaut, hasShutternautManager} = useRoles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        iconContainer: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          gap: 4,
        },
        favoritePressable: {
          ...commonStyles.minTouchTarget,
          ...commonStyles.justifyCenter,
          ...commonStyles.alignItemsCenter,
        },
      }),
    [commonStyles],
  );

  const needsPhotographerIcon = useMemo(() => {
    if (!(hasShutternaut || hasShutternautManager) || !eventData.shutternautData?.needsPhotographer) {
      return null;
    }
    return <AppIcon icon={AppIcons.needsPhotographer} color={theme.colors.onTwitarrNegativeButton} />;
  }, [
    hasShutternaut,
    hasShutternautManager,
    eventData.shutternautData?.needsPhotographer,
    theme.colors.onTwitarrNegativeButton,
  ]);

  const photographerIcon = useMemo(() => {
    if (!hasShutternaut || !eventData.shutternautData?.userIsPhotographer) {
      return null;
    }
    return <AppIcon icon={AppIcons.shutternaut} color={theme.colors.onTwitarrNegativeButton} />;
  }, [hasShutternaut, eventData.shutternautData?.userIsPhotographer, theme.colors.onTwitarrNegativeButton]);

  const favoriteIconColor = contentColor ?? theme.colors.twitarrYellow;
  const favoriteIcon = useMemo(() => {
    return (
      <Pressable
        onPress={onFavoritePress}
        style={styles.favoritePressable}
        hitSlop={8}
        accessibilityRole={'button'}
        accessibilityLabel={eventData.isFavorite ? 'Unfavorite event' : 'Favorite event'}
        accessibilityState={{selected: eventData.isFavorite}}
        testID={'eventCardFavorite-button'}>
        <AppIcon icon={eventData.isFavorite ? AppIcons.favorite : AppIcons.toggleFavorite} color={favoriteIconColor} />
      </Pressable>
    );
  }, [onFavoritePress, eventData.isFavorite, favoriteIconColor, styles.favoritePressable]);

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
  onFavorite,
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
          // This is to enable triggering a refresh from the PerformerScreenBase where
          // we don't hit the event endpoints directly. Eventually this will be removed since
          // we can use a cache reducer to also hit any performers that have the eventID in
          // their response.
          onFavorite?.();
          // If this is too slow to reload, a setQueryData here may be in order.
          const invalidations = UserNotificationData.getCacheKeys()
            .concat(EventData.getCacheKeys(eventData.eventID))
            .map(key => queryClient.invalidateQueries({queryKey: key}));
          await Promise.all(invalidations);
        },
        onSettled: () => setRefreshing(false),
      },
    );
  }, [eventData.eventID, eventData.isFavorite, eventFavoriteMutation, queryClient, onFavorite]);

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
