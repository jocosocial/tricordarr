import React, {forwardRef, useCallback, useMemo} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {DayPlannerCard} from '#src/Components/Cards/Schedule/DayPlannerCard';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {
  calculateItemLayout,
  DAY_PLANNER_CONFIG,
  generateTimeSlotLabels,
  getTimelineHeight,
} from '#src/Libraries/DayPlanner';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {DayPlannerItem, DayPlannerItemWithLayout, TimeSlotType} from '#src/Types/DayPlanner';

interface DayPlannerTimelineViewProps {
  items: DayPlannerItem[];
  dayStart: Date;
  dayEnd: Date;
}

export const DayPlannerTimelineView = forwardRef<ScrollView, DayPlannerTimelineViewProps>(
  ({items, dayStart, dayEnd}, ref) => {
    const {theme} = useAppTheme();
    const {commonStyles} = useStyles();
    const commonNavigation = useCommonStack();

    // Calculate layout for all items
    const layoutItems = useMemo(() => {
      return calculateItemLayout(items, dayStart, dayEnd);
    }, [items, dayStart, dayEnd]);

    // Generate time slot labels
    const timeSlots = useMemo(() => {
      return generateTimeSlotLabels(dayStart);
    }, [dayStart]);

    const handleItemPress = useCallback(
      (item: DayPlannerItemWithLayout) => {
        if (item.eventData) {
          commonNavigation.push(CommonStackComponents.eventScreen, {eventID: item.eventData.eventID});
        } else if (item.fezData) {
          if (item.type === 'lfg') {
            commonNavigation.push(CommonStackComponents.lfgScreen, {fezID: item.fezData.fezID});
          } else {
            commonNavigation.push(CommonStackComponents.personalEventScreen, {eventID: item.fezData.fezID});
          }
        }
      },
      [commonNavigation],
    );

    // Helper to get grid line style based on slot type
    const getGridLineStyle = useCallback(
      (slotType: TimeSlotType) => {
        switch (slotType) {
          case 'hour':
            return {borderTopWidth: 1, borderTopColor: theme.colors.outlineVariant};
          case 'halfHour':
            return {borderTopWidth: 0.5, borderTopColor: theme.colors.outlineVariant};
          case 'quarter':
            return {borderTopWidth: 0.5, borderTopColor: theme.colors.outlineVariant, opacity: 0.5};
        }
      },
      [theme.colors.outlineVariant],
    );

    const styles = StyleSheet.create({
      container: {
        flex: 1,
      },
      scrollContent: {
        flexDirection: 'row',
      },
      timeColumn: {
        width: 60,
        paddingRight: 8,
      },
      timeSlot: {
        height: DAY_PLANNER_CONFIG.ROW_HEIGHT,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
      },
      timeLabel: {
        fontSize: 12,
        color: theme.colors.onSurfaceVariant,
        marginTop: 0,
      },
      eventsColumn: {
        flex: 1,
        position: 'relative',
      },
      gridLines: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      gridLine: {
        height: DAY_PLANNER_CONFIG.ROW_HEIGHT,
      },
      eventsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      emptyMessage: {
        ...commonStyles.paddingVertical,
        ...commonStyles.paddingHorizontal,
      },
      emptyText: {
        textAlign: 'center',
        color: theme.colors.onSurfaceVariant,
      },
    });

    const timelineHeight = getTimelineHeight();

    if (items.length === 0) {
      return (
        <View style={styles.emptyMessage}>
          <Text style={styles.emptyText}>No items in your Day Planner for this day.</Text>
          <Text style={styles.emptyText}>
            Follow events on the schedule, join LFGs, or create personal events to see them here.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView ref={ref} style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Time labels column */}
        <View style={[styles.timeColumn, {height: timelineHeight}]}>
          {timeSlots.map((slot, index) => (
            <View key={index} style={[styles.timeSlot, getGridLineStyle(slot.slotType)]}>
              {slot.label ? <Text style={styles.timeLabel}>{slot.label}</Text> : null}
            </View>
          ))}
        </View>

        {/* Events column */}
        <View style={[styles.eventsColumn, {height: timelineHeight}]}>
          {/* Grid lines */}
          <View style={styles.gridLines}>
            {timeSlots.map((slot, index) => (
              <View key={index} style={[styles.gridLine, getGridLineStyle(slot.slotType)]} />
            ))}
          </View>

          {/* Event cards */}
          <View style={styles.eventsContainer}>
            {layoutItems.map(item => (
              <DayPlannerCard key={item.id} item={item} onPress={() => handleItemPress(item)} />
            ))}
          </View>
        </View>
      </ScrollView>
    );
  },
);
