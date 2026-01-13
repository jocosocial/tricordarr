import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, TouchableRipple} from 'react-native-paper';

import {CancelledBadge} from '#src/Components/Badges/CancelledBadge';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {DayPlannerItem, DayPlannerItemWithLayout} from '#src/Types/DayPlanner';

type DayPlannerCardContentLevel = 'titleOnly' | 'titleAndLocation';

interface DayPlannerCardProps {
  item: DayPlannerItemWithLayout;
  onPress?: () => void;
}

// Layout constants for the day planner card
// With 15-min rows at 25px: 30min=50px, 45min=75px, 60min=100px
const LAYOUT = {
  // Height thresholds for showing different content levels
  heightThresholds: {
    // Minimum height to show anything readable (title only, 1 line)
    titleOnly: 25,
    // Height needed to show title + location - allows 30min events to show location
    titleAndLocation: 40,
  },
  // Line heights used for calculating available space
  lineHeights: {
    title: 22,
    location: 18,
  },
  // Padding inside the card (4px padding + 2px vertical container padding × 2 + some margin)
  cardPadding: 10,
} as const;

// Static styles that don't change per-card
const staticStyles = StyleSheet.create({
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});

export const DayPlannerCard = ({item, onPress}: DayPlannerCardProps) => {
  const {theme} = useAppTheme();

  // Colors must be derived at render time because they depend on both the item's
  // color category (event type, LFG, personal, team events) and the current theme.
  const backgroundColor = DayPlannerItem.getBackgroundColor(item.color, theme.colors);
  const textColor = DayPlannerItem.getTextColor(item.color, theme.colors);

  // Calculate width based on column position
  const columnWidth = 100 / item.totalColumns;
  const leftPosition = item.columnIndex * columnWidth;

  // Determine what content to show based on available height
  const contentLevel = useMemo((): DayPlannerCardContentLevel => {
    if (item.height >= LAYOUT.heightThresholds.titleAndLocation) {
      return 'titleAndLocation'; // Show title and location
    } else {
      return 'titleOnly'; // Show only the title
    }
  }, [item.height]);

  // Calculate how many lines the title can have based on available space
  const titleLines = useMemo(() => {
    if (contentLevel === 'titleOnly') {
      // Use all available space for title when that's all we're showing
      const availableHeight = item.height - LAYOUT.cardPadding;
      return Math.max(1, Math.floor(availableHeight / LAYOUT.lineHeights.title));
    }
    return 2; // Default to 2 lines for title when showing other content
  }, [contentLevel, item.height]);

  // Calculate how many lines the location can have based on remaining space
  const locationLines = useMemo(() => {
    if (contentLevel !== 'titleAndLocation' || !item.location) {
      return 0;
    }
    // Calculate space used by title
    const titleSpace = titleLines * LAYOUT.lineHeights.title;
    const usedSpace = LAYOUT.cardPadding + titleSpace;

    // Calculate remaining space for location
    const remainingHeight = item.height - usedSpace;
    const maxLocationLines = Math.max(1, Math.floor(remainingHeight / LAYOUT.lineHeights.location));

    return maxLocationLines;
  }, [contentLevel, item.height, item.location, titleLines]);

  // Dynamic styles specific to this card instance
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          position: 'absolute',
          top: item.topOffset,
          left: `${leftPosition}%`,
          width: `${columnWidth}%`,
          height: item.height,
          paddingHorizontal: 2,
          paddingVertical: 1,
        },
        card: {
          flex: 1,
          backgroundColor,
          borderRadius: 4,
          padding: 4,
          overflow: 'hidden',
        },
        text: {
          color: textColor,
          fontWeight: 'bold',
        },
        location: {
          color: textColor,
        },
      }),
    [item.topOffset, item.height, leftPosition, columnWidth, backgroundColor, textColor],
  );

  const showLocation = contentLevel === 'titleAndLocation' && item.location;

  return (
    <View style={dynamicStyles.container}>
      <TouchableRipple style={dynamicStyles.card} onPress={onPress} borderless>
        <View style={staticStyles.content}>
          {item.cancelled && <CancelledBadge align={'left'} />}
          <Text style={dynamicStyles.text} numberOfLines={titleLines} ellipsizeMode={'tail'}>
            {item.title}
          </Text>
          {showLocation && (
            <Text
              style={dynamicStyles.location}
              variant={'bodySmall'}
              numberOfLines={locationLines}
              ellipsizeMode={'tail'}>
              {item.location}
            </Text>
          )}
        </View>
      </TouchableRipple>
    </View>
  );
};
