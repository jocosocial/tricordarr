import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, ScrollView, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {DayPlannerTimelineView} from '#src/Components/Views/Schedule/DayPlannerTimelineView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useDayPlanner} from '#src/Context/Contexts/DayPlannerContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {useEventsQuery} from '#src/Queries/Events/EventQueries';
import {useLfgListQuery, usePersonalEventsQuery} from '#src/Queries/Fez/FezQueries';

export interface DayPlannerPageControls {
  scrollToNow: () => void;
  refresh: () => Promise<void>;
}

/** Imperative handle so the parent can keep this page's scroll position in lockstep with the active page. */
export interface DayPlannerScrollController {
  scrollTo: (offsetY: number) => void;
}

interface DayPlannerPageProps {
  cruiseDay: number;
  isActive: boolean;
  /**
   * Whether this day is allowed to fetch yet. False keeps every query disabled (page shows the
   * loading spinner) until the parent's staged rollout reaches it - we're on a high-latency,
   * low-bandwidth network, so every cruise day firing its queries at once isn't acceptable.
   */
  enabled: boolean;
  /** Fires once this page's queries have finished, so the parent can enable this day's neighbors next. */
  onLoaded: (cruiseDay: number) => void;
  onActiveControlsChange: (controls: DayPlannerPageControls | null) => void;
  /** Registered regardless of active state, so the parent can sync this page's scroll position from outside. */
  onRegisterScrollController: (controller: DayPlannerScrollController | null) => void;
  /** Called only while active, so the parent can mirror the vertical scroll position onto the other pages. */
  onActiveScroll: (offsetY: number) => void;
  /**
   * Shared scroll offset from whichever page was last active, captured at the moment this slot's
   * cruiseDay changes. Used instead of the smart scrollToFirstItem/scrollToNow default so switching
   * days (by swipe or header tap) keeps you looking at the same time of day, not a fresh position.
   * Null only before any page has ever been scrolled (very first load).
   */
  initialScrollOffset: number | null;
}

/**
 * One day's worth of Day Planner content: its own queries, boundary calc, and timeline.
 * Mounted permanently for every cruise day inside a PagerView, but only fetches once `enabled` -
 * the parent stages rollout outward from the initially-viewed day so we don't fire every day's
 * queries at once on a slow ship network.
 */
export const DayPlannerPage = ({
  cruiseDay,
  isActive,
  enabled,
  onLoaded,
  onActiveControlsChange,
  onRegisterScrollController,
  onActiveScroll,
  initialScrollOffset,
}: DayPlannerPageProps) => {
  const {startDate} = useCruise();
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();
  const scrollViewRef = useRef<ScrollView>(null);
  const lastAutoScrolledCruiseDay = useRef<number | null>(null);
  const {preRegistrationMode} = usePreRegistration();
  const {buildDayPlannerItems, getDayBoundaries, getScrollOffsetForFirstItem, getScrollOffsetForTimeOfDay} =
    useDayPlanner();

  const {
    data: eventData,
    isLoading: isEventLoading,
    refetch: refetchEvents,
  } = useEventsQuery({
    cruiseDay: cruiseDay,
    dayplanner: true,
    options: {
      enabled,
    },
  });

  const {
    data: lfgJoinedData,
    isLoading: isLfgJoinedLoading,
    isFetchingNextPage: isLfgJoinedFetchingNextPage,
    hasNextPage: joinedHasNextPage,
    fetchNextPage: joinedFetchNextPage,
    refetch: refetchLfgJoined,
  } = useLfgListQuery({
    cruiseDay: cruiseDay - 1,
    endpoint: 'joined',
    hidePast: false,
    options: {
      enabled: enabled && !preRegistrationMode,
    },
  });

  const {
    data: personalEventData,
    isLoading: isPersonalEventLoading,
    isFetchingNextPage: isPersonalEventFetchingNextPage,
    hasNextPage: personalHasNextPage,
    fetchNextPage: personalFetchNextPage,
    refetch: refetchPersonalEvents,
  } = usePersonalEventsQuery({
    cruiseDay: cruiseDay - 1,
    hidePast: false,
    options: {
      enabled: enabled && !preRegistrationMode,
    },
  });

  useEffect(() => {
    if (joinedHasNextPage && !isLfgJoinedFetchingNextPage) {
      joinedFetchNextPage();
    }
    if (personalHasNextPage && !isPersonalEventFetchingNextPage) {
      personalFetchNextPage();
    }
  }, [
    joinedFetchNextPage,
    joinedHasNextPage,
    isLfgJoinedFetchingNextPage,
    personalFetchNextPage,
    personalHasNextPage,
    isPersonalEventFetchingNextPage,
  ]);

  const dayPlannerItems = useMemo(() => {
    return buildDayPlannerItems(eventData, lfgJoinedData, personalEventData);
  }, [eventData, lfgJoinedData, personalEventData, buildDayPlannerItems]);

  const {tzAtTime} = useTimeZone();

  const preliminaryBoundaries = useMemo(() => {
    return getDayBoundaries(startDate, cruiseDay, appConfig.schedule.enableLateDayFlip, appConfig.portTimeZoneID);
  }, [startDate, cruiseDay, appConfig.schedule.enableLateDayFlip, appConfig.portTimeZoneID, getDayBoundaries]);

  const boatTimeZoneID = useMemo(() => {
    return tzAtTime(preliminaryBoundaries.dayStart);
  }, [preliminaryBoundaries.dayStart, tzAtTime]);

  const {dayStart, dayEnd} = useMemo(() => {
    return getDayBoundaries(startDate, cruiseDay, appConfig.schedule.enableLateDayFlip, boatTimeZoneID);
  }, [startDate, cruiseDay, appConfig.schedule.enableLateDayFlip, boatTimeZoneID, getDayBoundaries]);

  // Not-yet-enabled queries report isLoading=false (they're inactive, not loading), so treat
  // "not enabled yet" as loading too - otherwise a not-yet-staged day would flash as a
  // legitimately empty day instead of "still waiting its turn to load".
  const showLoading = !enabled || isEventLoading || isLfgJoinedLoading || isPersonalEventLoading;

  const scrollToNow = useCallback(() => {
    if (!scrollViewRef.current) {
      return;
    }
    const offset = getScrollOffsetForTimeOfDay(boatTimeZoneID, dayStart);
    scrollViewRef.current.scrollTo({y: offset, animated: true});
  }, [boatTimeZoneID, dayStart, getScrollOffsetForTimeOfDay]);

  const scrollToFirstItem = useCallback(() => {
    if (!scrollViewRef.current) {
      return;
    }
    const offset = getScrollOffsetForFirstItem(dayPlannerItems, dayStart);
    scrollViewRef.current.scrollTo({y: offset, animated: true});
  }, [dayPlannerItems, dayStart, getScrollOffsetForFirstItem]);

  const refresh = useCallback(async () => {
    const refreshes: Promise<any>[] = [refetchEvents()];
    if (!preRegistrationMode) {
      refreshes.push(refetchLfgJoined(), refetchPersonalEvents());
    }
    await Promise.all(refreshes);
  }, [refetchEvents, refetchLfgJoined, refetchPersonalEvents, preRegistrationMode]);

  /**
   * Position this slot when it starts showing a new cruiseDay: carry over whatever scroll
   * offset the previously-active day was at (so switching days keeps the same time of day
   * in view), falling back to the smart scrollToFirstItem default only before any page has
   * ever been scrolled. Gated by lastAutoScrolledCruiseDay so socket/refetch updates that
   * rebuild dayPlannerItems do not jump the timeline mid-view.
   */
  useEffect(() => {
    if (showLoading || !scrollViewRef.current) {
      return;
    }
    if (lastAutoScrolledCruiseDay.current === cruiseDay) {
      return;
    }
    const rafId = requestAnimationFrame(() => {
      if (initialScrollOffset !== null) {
        scrollViewRef.current?.scrollTo({y: initialScrollOffset, animated: false});
      } else {
        scrollToFirstItem();
      }
      lastAutoScrolledCruiseDay.current = cruiseDay;
    });
    return () => cancelAnimationFrame(rafId);
  }, [showLoading, cruiseDay, initialScrollOffset, scrollToFirstItem]);

  /**
   * Tell the parent once this day's queries have actually finished, so it can advance the
   * staged rollout to this day's immediate neighbors next.
   */
  useEffect(() => {
    if (enabled && !showLoading) {
      onLoaded(cruiseDay);
    }
  }, [enabled, showLoading, cruiseDay, onLoaded]);

  /**
   * Only the centered/active page should answer the header's "scroll to now" tap
   * and the nav menu's manual refresh action.
   */
  useEffect(() => {
    if (!isActive) {
      return;
    }
    onActiveControlsChange({scrollToNow, refresh});
    return () => onActiveControlsChange(null);
  }, [isActive, scrollToNow, refresh, onActiveControlsChange]);

  /**
   * Expose an imperative scrollTo regardless of active state, so the parent can keep this
   * page's vertical position mirrored to the active page even while it's off-screen -
   * ready the instant a swipe lands on it.
   */
  useEffect(() => {
    onRegisterScrollController({
      scrollTo: offsetY => scrollViewRef.current?.scrollTo({y: offsetY, animated: false}),
    });
    return () => onRegisterScrollController(null);
  }, [onRegisterScrollController]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!isActive) {
        return;
      }
      onActiveScroll(event.nativeEvent.contentOffset.y);
    },
    [isActive, onActiveScroll],
  );

  return (
    <View style={commonStyles.flex}>
      {showLoading ? (
        <View style={commonStyles.loadingContainer}>
          <ActivityIndicator size={'large'} />
        </View>
      ) : (
        <DayPlannerTimelineView
          ref={scrollViewRef}
          items={dayPlannerItems}
          dayStart={dayStart}
          dayEnd={dayEnd}
          timeZoneID={boatTimeZoneID}
          selectedCruiseDay={cruiseDay}
          onScroll={handleScroll}
        />
      )}
    </View>
  );
};
