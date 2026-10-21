import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {ScheduleItemCardBase} from '#src/Components/Cards/Schedule/ScheduleItemCardBase';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useDayPlanner} from '#src/Context/Contexts/DayPlannerContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useEventCacheReducer} from '#src/Hooks/Events/useEventCacheReducer';
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
  /** When set (e.g. gold team), favorite icons use this color for contrast. */
  contentColor?: string;
}

interface EventCardFavoriteIconProps {
  isFavorite: boolean;
  refreshing: boolean;
  onPress: () => void;
  /** When set (e.g. gold team), the icon uses this color for contrast. */
  contentColor?: string;
}

// Layout stays icon-sized; the tap target is grown with hitSlop only. Up/right lean into the
// card's own padding, so the target clears 44pt without overlapping the title or duration text.
const favoriteHitSlop = {top: 16, right: 16, bottom: 12, left: 12};

/**
 * Favorite toggle for an event card. The tap target expands with hitSlop rather than growing
 * the icon's layout size, and the spinner is stacked on top of the icon (rather than swapped
 * in for it) inside a slot fixed to the icon's own footprint, so mounting/unmounting it while
 * mutating never changes the row's layout size — which was previously pushing single-line
 * titles onto two lines.
 */
const EventCardFavoriteIcon = ({isFavorite, refreshing, onPress, contentColor}: EventCardFavoriteIconProps) => {
  const {theme} = useAppTheme();
  const {styleDefaults} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        slot: {
          width: styleDefaults.iconSize,
          height: styleDefaults.iconSize,
          alignItems: 'center',
          justifyContent: 'center',
        },
        hidden: {
          opacity: 0,
        },
        spinnerOverlay: {
          ...StyleSheet.absoluteFill,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [styleDefaults.iconSize],
  );

  const iconColor = contentColor ?? theme.colors.twitarrYellow;

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={onPress}
        hitSlop={favoriteHitSlop}
        disabled={refreshing}
        style={refreshing && styles.hidden}
        accessibilityRole={'button'}
        accessibilityLabel={isFavorite ? 'Unfavorite event' : 'Favorite event'}
        accessibilityState={{selected: isFavorite, busy: refreshing}}
        testID={'eventCardFavorite-button'}>
        <AppIcon icon={isFavorite ? AppIcons.favorite : AppIcons.toggleFavorite} color={iconColor} />
      </Pressable>
      {refreshing && (
        <View style={styles.spinnerOverlay}>
          <ActivityIndicator size={'small'} />
        </View>
      )}
    </View>
  );
};

/**
 * Right-side icons for an event card (photographer markers and favorite toggle).
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

  return (
    <View style={styles.iconContainer}>
      {needsPhotographerIcon}
      {photographerIcon}
      <EventCardFavoriteIcon
        isFavorite={eventData.isFavorite}
        refreshing={refreshing}
        onPress={onFavoritePress}
        contentColor={contentColor}
      />
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
  const {isLoggedIn} = useSession();
  const eventFavoriteMutation = useEventFavoriteMutation();
  const queryClient = useQueryClient();
  const {updateFavorite, primeEventDetail} = useEventCacheReducer();
  const {getDayPlannerColor, getBackgroundColor, getTextColor} = useDayPlanner();
  const [refreshing, setRefreshing] = useState(false);

  const onFavoritePress = useCallback(() => {
    setRefreshing(true);
    const newValue = !eventData.isFavorite;
    // Optimistic: flip the cache immediately so the star is already correct by the time the
    // spinner clears, instead of waiting on a (possibly slow) network round trip to do it.
    updateFavorite(eventData, newValue);
    eventFavoriteMutation.mutate(
      {
        eventID: eventData.eventID,
        action: newValue ? 'favorite' : 'unfavorite',
      },
      {
        onSuccess: async () => {
          const invalidations = UserNotificationData.getCacheKeys().map(key =>
            queryClient.invalidateQueries({queryKey: key}),
          );
          await Promise.all(invalidations);
        },
        onError: () => {
          updateFavorite(eventData, !newValue);
        },
        onSettled: () => setRefreshing(false),
      },
    );
  }, [eventData, eventFavoriteMutation, queryClient, updateFavorite]);

  const handlePress = useCallback(() => {
    primeEventDetail(eventData);
    onPress?.();
  }, [eventData, onPress, primeEventDetail]);

  const cardStyleAndContentColor = useMemo(() => {
    const color = getDayPlannerColor({
      type: 'event',
      title: eventData.title,
      eventType: eventData.eventType,
    });
    const backgroundColor = getBackgroundColor(color, theme.colors);
    const contentColor = getTextColor(color, theme.colors);
    const showMarkerBorder = color === 'goldTeam';
    return {
      cardStyle: StyleSheet.create({card: {backgroundColor}}).card,
      contentColor,
      showMarkerBorder,
    };
  }, [eventData.title, eventData.eventType, theme.colors, getDayPlannerColor, getBackgroundColor, getTextColor]);

  const getRight = useCallback(() => {
    // Favoriting requires an account; hide the toggle entirely rather than let it fail on tap.
    if (hideFavorite || !isLoggedIn) {
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
  }, [eventData, refreshing, hideFavorite, isLoggedIn, onFavoritePress, cardStyleAndContentColor.contentColor]);

  return (
    <ScheduleItemCardBase
      onPress={handlePress}
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
