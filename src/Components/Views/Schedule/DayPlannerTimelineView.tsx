import React, {forwardRef, useCallback, useMemo} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {DayPlannerCard} from '#src/Components/Cards/Schedule/DayPlannerCard';
import {DayPlannerNowDivider} from '#src/Components/Views/Schedule/DayPlannerNowDivider';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {DAY_PLANNER_CONFIG, useDayPlanner} from '#src/Context/Contexts/DayPlannerContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useEventCacheReducer} from '#src/Hooks/Events/useEventCacheReducer';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
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
  /** Optional pull-to-refresh control passed through to the ScrollView. The Day Planner pager does not use it. */
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /**
   * Adds a row after dayEnd so its line gets an hour label. dayEnd must be on the hour. The Day Planner pager does
   * not use it.
   */
  showEndLabel?: boolean;
  /** Item to keep in the first column and highlight. The Day Planner pager does not use it. */
  pinnedItemId?: string;
  /**
   * Content above the timeline, inside the scroll view so it scrolls and refreshes with it. The Day Planner pager
   * does not use it.
   */
  header?: React.ReactNode;
}

export const DayPlannerTimelineView = forwardRef<ScrollView, DayPlannerTimelineViewProps>(
  (
    {
      items,
      dayStart,
      dayEnd,
      timeZoneID,
      selectedCruiseDay,
      onScrollSettled,
      refreshControl,
      showEndLabel,
      pinnedItemId,
      header,
    },
    ref,
  ) => {
    const {theme} = useAppTheme();
    const {commonStyles} = useStyles();
    const commonNavigation = useCommonStack();
    const {appConfig} = useConfig();
    const {adjustedCruiseDayToday} = useCruise();
    const {preRegistrationMode} = usePreRegistration();
    const {calculateItemLayout, generateTimeSlotLabels, getTimelineHeight} = useDayPlanner();
    const {primeEventDetail} = useEventCacheReducer();
    const {primeFezDetail} = useFezCacheReducer();

    // Calculate layout for all items
    const layoutItems = useMemo(() => {
      return calculateItemLayout(items, dayStart, dayEnd, appConfig.schedule.compactThemeEvents, pinnedItemId);
    }, [items, dayStart, dayEnd, appConfig.schedule.compactThemeEvents, calculateItemLayout, pinnedItemId]);

    // Rows in the window. The real Day Planner's window is exactly 24h (getDayBoundaries adds absolute
    // hours from the same base), so this stays 96 there; the overlap view passes a shorter window.
    const totalSlots = useMemo(
      () => Math.round((dayEnd.getTime() - dayStart.getTime()) / (DAY_PLANNER_CONFIG.MINUTES_PER_ROW * 60 * 1000)),
      [dayStart, dayEnd],
    );

    const displaySlots = showEndLabel ? totalSlots + 1 : totalSlots;

    // Generate time slot labels (in boat time when timeZoneID provided)
    const timeSlots = useMemo(() => {
      return generateTimeSlotLabels(dayStart, timeZoneID, displaySlots);
    }, [dayStart, timeZoneID, displaySlots, generateTimeSlotLabels]);

    const handleItemPress = useCallback(
      (item: DayPlannerItemWithLayout) => {
        if (item.eventData) {
          // Seed the detail cache from the data already in hand so EventScreen opens instantly
          // instead of spinning on a redundant fetch, mirroring EventCard's onPress.
          primeEventDetail(item.eventData);
          commonNavigation.push(CommonStackComponents.eventScreen, {eventID: item.eventData.eventID});
        } else if (item.fezData) {
          primeFezDetail(item.fezData);
          if (item.type === 'lfg') {
            commonNavigation.push(CommonStackComponents.lfgScreen, {fezID: item.fezData.fezID});
          } else {
            commonNavigation.push(CommonStackComponents.personalEventScreen, {eventID: item.fezData.fezID});
          }
        }
      },
      [commonNavigation, primeEventDetail, primeFezDetail],
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
          // Stacks the header above the timeline row, and fills the row's width.
          scrollColumn: {
            flex: 1,
          },
          timelineRow: {
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
    const timelineHeight = getTimelineHeight(displaySlots);

    if (items.length === 0) {
      return (
        <View style={styles.emptyMessage}>
          <Text style={styles.emptyText}>No items in your Day Planner for this day.</Text>
          {preRegistrationMode ? (
            <Text style={styles.emptyText}>
              Follow events on the schedule, or use the New button to create your own LFGs and private events. You'll be
              able to join other LFGs and Private Events once on board.
            </Text>
          ) : (
            <Text style={styles.emptyText}>
              Follow events on the schedule, join LFGs, or use the New button to create your own LFGs and private
              events.
            </Text>
          )}
        </View>
      );
    }

    return (
      <ScrollView
        ref={ref}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        scrollsToTop={false}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={onScrollSettled}
        onMomentumScrollEnd={onScrollSettled}>
        <View style={styles.scrollColumn}>
          {header}
          <View style={[styles.timelineRow, {height: timelineHeight}]}>
            {/* Only today's page needs the divider; mounting it elsewhere just runs a minute timer to render null. */}
            {selectedCruiseDay === adjustedCruiseDayToday && (
              <DayPlannerNowDivider
                dayStart={dayStart}
                timelineHeight={getTimelineHeight(totalSlots)}
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
                  <DayPlannerCard
                    key={item.id}
                    item={item}
                    onPress={() => handleItemPress(item)}
                    highlighted={item.id === pinnedItemId}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  },
);
