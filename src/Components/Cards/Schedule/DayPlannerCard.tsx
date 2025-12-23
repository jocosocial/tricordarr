import {format} from 'date-fns';
import React, {useMemo} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {Text, TouchableRipple} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {DayPlannerItem, DayPlannerItemWithLayout} from '#src/Types/DayPlanner';

interface DayPlannerCardProps {
  item: DayPlannerItemWithLayout;
  onPress?: () => void;
}

// Height thresholds for showing different content levels
// With 15-min rows at 25px: 30min=50px, 45min=75px, 60min=100px
const HEIGHT_THRESHOLDS = {
  // Minimum height to show anything readable (title only, 1 line)
  TITLE_ONLY: 25,
  // Height needed to show title (1-2 lines) + time - allows 30min events to show time
  TITLE_AND_TIME: 40,
  // Height needed to show title + time + location - allows 30min events to show location
  FULL_CONTENT: 50,
} as const;

// Line heights used for calculating available space
const LINE_HEIGHTS = {
  TITLE: 14,
  TIME: 12,
  LOCATION: 12,
} as const;

// Padding inside the card
const CARD_PADDING = 10; // 4px padding + 2px vertical container padding × 2 + some margin

// Static styles that don't change per-card
const staticStyles = StyleSheet.create({
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});

export const DayPlannerCard = ({item, onPress}: DayPlannerCardProps) => {
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();

  const backgroundColor = DayPlannerItem.getBackgroundColor(item.color, theme.colors);
  const textColor = DayPlannerItem.getTextColor(item.color, theme.colors);

  // Calculate width based on column position
  const columnWidth = 100 / item.totalColumns;
  const leftPosition = item.columnIndex * columnWidth;

  // Determine what content to show based on available height
  const contentLevel = useMemo(() => {
    if (item.height >= HEIGHT_THRESHOLDS.FULL_CONTENT) {
      return 'full'; // Show title, time, and location
    } else if (item.height >= HEIGHT_THRESHOLDS.TITLE_AND_TIME) {
      return 'titleAndTime'; // Show title and time only
    } else {
      return 'titleOnly'; // Show only the title
    }
  }, [item.height]);

  // Calculate how many lines the title can have based on available space
  const titleLines = useMemo(() => {
    if (contentLevel === 'titleOnly') {
      // Use all available space for title when that's all we're showing
      const availableHeight = item.height - CARD_PADDING;
      return Math.max(1, Math.floor(availableHeight / LINE_HEIGHTS.TITLE));
    }
    return 2; // Default to 2 lines for title when showing other content
  }, [contentLevel, item.height]);

  // Calculate how many lines the location can have based on remaining space
  const locationLines = useMemo(() => {
    if (contentLevel !== 'full' || !item.location) {
      return 0;
    }
    // Calculate space used by title and time
    const titleSpace = titleLines * LINE_HEIGHTS.TITLE;
    const timeSpace = LINE_HEIGHTS.TIME;
    const usedSpace = CARD_PADDING + titleSpace + timeSpace;

    // Calculate remaining space for location
    const remainingHeight = item.height - usedSpace;
    const maxLocationLines = Math.max(1, Math.floor(remainingHeight / LINE_HEIGHTS.LOCATION));

    return maxLocationLines;
  }, [contentLevel, item.height, item.location, titleLines]);

  // Dynamic styles specific to this card instance
  const containerStyle: ViewStyle = {
    position: 'absolute',
    top: item.topOffset,
    left: `${leftPosition}%`,
    width: `${columnWidth}%`,
    height: item.height,
    paddingHorizontal: 2,
    paddingVertical: 1,
  };

  const cardStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    borderRadius: 4,
    padding: 4,
    overflow: 'hidden',
  };

  const textStyle = {
    color: textColor,
    fontSize: 12,
    fontWeight: 'bold' as const,
    lineHeight: 14,
  };

  const timeStyle = {
    color: textColor,
    fontSize: 10,
    opacity: 0.9,
    lineHeight: 12,
  };

  const cancelledStyle = {
    ...commonStyles.bold,
    color: textColor,
    fontSize: 10,
    backgroundColor: theme.colors.error,
    paddingHorizontal: 4,
    borderRadius: 2,
    alignSelf: 'flex-start' as const,
    marginBottom: 2,
  };

  const timeString = `${format(item.startTime, 'h:mm a')} - ${format(item.endTime, 'h:mm a')}`;
  const showTime = contentLevel === 'titleAndTime' || contentLevel === 'full';
  const showLocation = contentLevel === 'full' && item.location;

  return (
    <View style={containerStyle}>
      <TouchableRipple style={cardStyle} onPress={onPress} borderless>
        <View style={staticStyles.content}>
          {item.cancelled && (
            <Text style={cancelledStyle} numberOfLines={1}>
              CANCELLED
            </Text>
          )}
          <Text style={textStyle} numberOfLines={titleLines} ellipsizeMode={'tail'}>
            {item.title}
          </Text>
          {showTime && (
            <Text style={timeStyle} numberOfLines={1} ellipsizeMode={'tail'}>
              {timeString}
            </Text>
          )}
          {showLocation && (
            <Text style={timeStyle} numberOfLines={locationLines} ellipsizeMode={'tail'}>
              {item.location}
            </Text>
          )}
        </View>
      </TouchableRipple>
    </View>
  );
};
