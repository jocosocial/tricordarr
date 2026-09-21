import React, {forwardRef, useCallback, useMemo} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {DayPlannerCard} from '#src/Components/Cards/Schedule/DayPlannerCard';
import {DayPlannerNowDivider} from '#src/Components/Views/Schedule/DayPlannerNowDivider';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {DAY_PLANNER_CONFIG, useDayPlanner} from '#src/Context/Contexts/DayPlannerContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useEventCacheReducer} from '#src/Hooks/Events/useEventCacheReducer';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {DayPlannerItem, DayPlannerItemWithLayout, TimeSlotType} from '#src/Types/DayPlanner';

interface DayPlannerTimelineViewProps {
  items: DayPlannerItem[];
  dayStart: Date;
  dayEnd: Date;
  /** Boat timezone for slot labels (e.g. America/Lower_Princes). When set, labels show boat time. */
  timeZoneID?: string;
  /** The cruise day being viewed (1-indexed). Used by DayPlannerNowDivider to show "now" when viewing today. */
  selectedCruiseDay?: number;
  /**
   * Fires when a user scroll gesture comes to rest (drag release / momentum end), not on every
   * frame. The Day Planner uses this to share one resting offset across days; a throttled onScroll
   * would cost a callback per frame for the same information.
   */
  onScrollSettled?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export const DayPlannerTimelineView = forwardRef<ScrollView, DayPlannerTimelineViewProps>(
  ({items, dayStart, dayEnd, timeZoneID, selectedCruiseDay, onScrollSettled}, ref) => {
    const {theme} = useAppTheme();
    const {commonStyles} = useStyles();
    const commonNavigation = useCommonStack();
    const {appConfig} = useConfig();
    const {adjustedCruiseDayToday} = useCruise();
    const {calculateItemLayout, generateTimeSlotLabels, getTimelineHeight} = useDayPlanner();
    const {primeEventDetail} = useEventCacheReducer();

    // Calculate layout for all items
    const layoutItems = useMemo(() => {
      return calculateItemLayout(items, dayStart, dayEnd, appConfig.schedule.compactThemeEvents);
    }, [items, dayStart, dayEnd, appConfig.schedule.compactThemeEvents, calculateItemLayout]);

    // Generate time slot labels (in boat time when timeZoneID provided)
    const timeSlots = useMemo(() => {
      return generateTimeSlotLabels(dayStart, timeZoneID);
    }, [dayStart, timeZoneID, generateTimeSlotLabels]);

    const handleItemPress = useCallback(
      (item: DayPlannerItemWithLayout) => {
        if (item.eventData) {
          // Seed the detail cache from the data already in hand so EventScreen opens instantly
          // instead of spinning on a redundant fetch, mirroring EventCard's onPress.
          primeEventDetail(item.eventData);
          commonNavigation.push(CommonStackComponents.eventScreen, {eventID: item.eventData.eventID});
        } else if (item.fezData) {
          if (item.type === 'lfg') {
            commonNavigation.push(CommonStackComponents.lfgScreen, {fezID: item.fezData.fezID});
          } else {
            commonNavigation.push(CommonStackComponents.personalEventScreen, {eventID: item.fezData.fezID});
          }
        }
      },
      [commonNavigation, primeEventDetail],
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

    const styles = useMemo(
      () =>
        StyleSheet.create({
          container: {
            flex: 1,
          },
          scrollContent: {
            flexDirection: 'row',
            flexGrow: 1,
          },
          timelineRow: {
            flex: 1,
            flexDirection: 'row',
            position: 'relative',
          },
          timeColumn: {
            width: 60,
            paddingRight: 8,
            zIndex: 1,
          },
          timeSlot: {
            height: DAY_PLANNER_CONFIG.ROW_HEIGHT,
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
          },
          timeLabel: {
            color: theme.colors.onBackground,
            marginTop: 0,
            backgroundColor: theme.colors.background,
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
            zIndex: 2,
          },
          emptyMessage: {
            ...commonStyles.paddingVertical,
            ...commonStyles.paddingHorizontal,
          },
          emptyText: {
            textAlign: 'center',
            color: theme.colors.onSurfaceVariant,
          },
        }),
      [theme, commonStyles],
    );
    const timelineHeight = getTimelineHeight();

    if (items.length === 0) {
      return (
        <View style={styles.emptyMessage}>
          <Text style={styles.emptyText}>No items in your Day Planner for this day.</Text>
          <Text style={styles.emptyText}>
            Follow events on the schedule! Once you're on board, you can join LFGs or create private events to see them
            here.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        ref={ref}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        scrollsToTop={false}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={onScrollSettled}
        onMomentumScrollEnd={onScrollSettled}>
        <View style={[styles.timelineRow, {height: timelineHeight}]}>
          {/* Only today's page needs the divider; mounting it elsewhere just runs a minute timer to render null. */}
          {selectedCruiseDay === adjustedCruiseDayToday && (
            <DayPlannerNowDivider
              dayStart={dayStart}
              selectedCruiseDay={selectedCruiseDay}
              boatTimeZoneID={timeZoneID ?? appConfig.portTimeZoneID}
            />
          )}

          {/* Time labels column — zIndex so it renders above the now divider */}
          <View style={[styles.timeColumn, {height: timelineHeight}]}>
            {timeSlots.map((slot, index) => (
              <View key={index} style={[styles.timeSlot, getGridLineStyle(slot.slotType)]}>
                {slot.label ? (
                  <Text style={styles.timeLabel} variant={'bodyMedium'}>
                    {slot.label}
                  </Text>
                ) : null}
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
        </View>
      </ScrollView>
    );
  },
);
