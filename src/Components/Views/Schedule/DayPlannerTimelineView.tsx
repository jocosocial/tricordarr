import React, {forwardRef, useCallback, useEffect, useMemo, useState} from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {Text} from 'react-native-paper';
import Animated, {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';

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
  /**
   * Long press on a card. The caller owns the resulting menu (see DayPlannerCardActionsMenu), keeping
   * the timeline menu-agnostic. The overlap view does not pass it, so its cards only respond to a tap.
   */
  onItemLongPress?: (item: DayPlannerItemWithLayout, event: GestureResponderEvent) => void;
  /**
   * Passed to the ScrollView. The Day Planner sets it false while a card menu is open: the menu's
   * overlay only catches NEW touches, so a long press that is held and then dragged would still
   * scroll the timeline under the menu. Disabling scroll cancels that in-progress drag.
   */
  scrollEnabled?: boolean;
  /**
   * Fixed-width lanes instead of fitting every lane on screen. Each lane is a third of the screen
   * (DAY_PLANNER_CONFIG.EXPANDED_VISIBLE_COLUMNS), and when the busiest stretch needs more lanes than that the
   * events area scrolls sideways while the time column stays put. Toggled by ExpandHeaderButton.
   */
  expanded?: boolean;
  /** Replaces the Day Planner's empty-day message. */
  emptyMessage?: string;
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
      onItemLongPress,
      scrollEnabled,
      expanded,
      emptyMessage,
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

    // Width the events column actually has on screen, measured so expanded lanes can be sized to it.
    const [eventsViewportWidth, setEventsViewportWidth] = useState(0);
    const handleEventsLayout = useCallback((event: LayoutChangeEvent) => {
      setEventsViewportWidth(event.nativeEvent.layout.width);
    }, []);

    // Lanes across the whole expanded events area: the busiest stretch's lane count, but never fewer than fit on
    // screen, so a quiet stretch still gets fixed-width lanes. Zero when not expanded (or not measured yet).
    const expandedColumns = useMemo(() => {
      if (!expanded || eventsViewportWidth === 0) {
        return 0;
      }
      const maxColumns = layoutItems.reduce((max, item) => Math.max(max, item.totalColumns), 0);
      return Math.max(DAY_PLANNER_CONFIG.EXPANDED_VISIBLE_COLUMNS, maxColumns);
    }, [expanded, eventsViewportWidth, layoutItems]);

    // Cards size themselves as a share of their container, so giving every card the area's full lane count makes
    // each one exactly one fixed lane wide.
    const displayItems = useMemo(
      () => (expandedColumns ? layoutItems.map(item => ({...item, totalColumns: expandedColumns})) : layoutItems),
      [expandedColumns, layoutItems],
    );

    // Width of the sideways-scrolling events area, or zero when the lanes fit on screen.
    const eventsContentWidth =
      expandedColumns > DAY_PLANNER_CONFIG.EXPANDED_VISIBLE_COLUMNS
        ? (expandedColumns * eventsViewportWidth) / DAY_PLANNER_CONFIG.EXPANDED_VISIBLE_COLUMNS
        : 0;

    /**
     * Sideways scrolling is a pan gesture moving the lanes, not a nested horizontal ScrollView: two nested
     * ScrollViews each lock to their own axis, so a diagonal drag could only ever move one of them. The pan runs
     * alongside the native vertical scroll, so one drag moves both. translateX runs from 0 (left edge) down to
     * minTranslateX (right edge).
     */
    const translateX = useSharedValue(0);
    const panStartX = useSharedValue(0);
    const minTranslateX = useSharedValue(0);
    const canPan = eventsContentWidth > 0 && scrollEnabled !== false;

    // Keep the lanes in bounds when the area shrinks (fewer lanes, collapsing, a resize), e.g. not stranded past
    // the right edge.
    useEffect(() => {
      const min = eventsContentWidth > 0 ? eventsViewportWidth - eventsContentWidth : 0;
      minTranslateX.set(min);
      if (translateX.get() < min || translateX.get() > 0) {
        cancelAnimation(translateX);
        translateX.set(Math.min(0, Math.max(min, translateX.get())));
      }
    }, [eventsContentWidth, eventsViewportWidth, minTranslateX, translateX]);

    // Recognized together with the vertical ScrollView's own native gesture.
    const verticalScrollGesture = useMemo(() => Gesture.Native(), []);
    const horizontalPanGesture = useMemo(
      () =>
        Gesture.Pan()
          .enabled(canPan)
          // A mostly vertical drag only scrolls vertically until it has moved sideways too.
          .activeOffsetX([-10, 10])
          .simultaneousWithExternalGesture(verticalScrollGesture)
          .onBegin(() => {
            cancelAnimation(translateX);
          })
          .onStart(() => {
            panStartX.set(translateX.get());
          })
          .onUpdate(event => {
            translateX.set(Math.min(0, Math.max(minTranslateX.get(), panStartX.get() + event.translationX)));
          })
          .onEnd(event => {
            // The fling's glide is part of the drag, like a native ScrollView's, so it ignores reduced motion. Under
            // ReduceMotion.System, a device with animations turned off would stop the lanes dead on release.
            translateX.set(
              withDecay({velocity: event.velocityX, clamp: [minTranslateX.get(), 0], reduceMotion: ReduceMotion.Never}),
            );
          }),
      [canPan, verticalScrollGesture, translateX, panStartX, minTranslateX],
    );

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

    // Sized separately from `styles` so measuring the viewport doesn't rebuild every other style.
    // Expanded, it clips the panned lanes so they slide under the time column rather than over it.
    const sizedStyles = useMemo(
      () =>
        StyleSheet.create({
          eventsColumn: {
            ...styles.eventsColumn,
            height: timelineHeight,
            overflow: expanded ? 'hidden' : 'visible',
          },
        }),
      [styles.eventsColumn, timelineHeight, expanded],
    );

    // Sized and moved in one animated style. The lanes fill the column until they need more room than it has,
    // then take their full scrolling width.
    const pannedEventsStyle = useAnimatedStyle(() => ({
      position: 'relative',
      width: eventsContentWidth > 0 ? eventsContentWidth : '100%',
      height: timelineHeight,
      transform: [{translateX: translateX.get()}],
    }));

    if (items.length === 0) {
      if (emptyMessage) {
        return (
          <View style={styles.emptyMessage}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        );
      }
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

    // Grid lines and cards. They sit in the same wrappers whether or not the timeline is expanded, and expanding
    // only changes those wrappers' widths. Swapping in different wrappers instead would remount every card on every
    // rendered day, which left the screen blank for a moment after each toggle.
    const eventsColumnContent = (
      <>
        {/* Grid lines */}
        <View style={styles.gridLines}>
          {timeSlots.map((slot, index) => (
            <View key={index} style={[styles.gridLine, getGridLineStyle(slot.slotType)]} />
          ))}
        </View>

        {/* Event cards */}
        <View style={styles.eventsContainer}>
          {displayItems.map(item => (
            <DayPlannerCard
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item)}
              onLongPress={onItemLongPress ? event => onItemLongPress(item, event) : undefined}
              highlighted={item.id === pinnedItemId}
            />
          ))}
        </View>
      </>
    );

    return (
      <GestureDetector gesture={verticalScrollGesture}>
        <ScrollView
          ref={ref}
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          scrollsToTop={false}
          scrollEnabled={scrollEnabled}
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
              <View style={sizedStyles.eventsColumn} onLayout={handleEventsLayout}>
                <GestureDetector gesture={horizontalPanGesture}>
                  <Animated.View style={pannedEventsStyle}>{eventsColumnContent}</Animated.View>
                </GestureDetector>
              </View>
            </View>
          </View>
        </ScrollView>
      </GestureDetector>
    );
  },
);
