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

/** Imperative handle so the parent can align this page's scroll position with the active page. */
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
  /**
   * Whether to build this day's timeline yet. The timeline is ~200 views tall (96 quarter-hour
   * slots rendered as both labels and grid lines), so mounting all of them for every cruise day
   * at once costs well over a thousand views for a screen that shows one day at a time. The
   * parent only turns this on for days at or adjacent to one that's been viewed, and never turns
   * it back off - so cold open builds three timelines instead of the whole cruise, and no swipe
   * ever pays to mount or tear one down mid-gesture.
   */
  renderTimeline: boolean;
  /** Fires once this page's queries have finished, so the parent can enable this day's neighbors next. */
  onLoaded: (cruiseDay: number) => void;
  onActiveControlsChange: (controls: DayPlannerPageControls | null) => void;
  /** Registered regardless of active state, so the parent can sync this page's scroll position from outside. */
  onRegisterScrollController: (controller: DayPlannerScrollController | null) => void;
  /**
   * Called when a user scroll gesture on the active page comes to rest, so the parent can record
   * the shared offset. Deliberately not a per-frame onScroll: mirroring every frame onto every
   * other mounted day put hundreds of scrollTo calls per second across the bridge.
   */
  onScrollSettled: (offsetY: number) => void;
  /**
   * Pulls the offset the last-scrolled day came to rest at, so a day being shown for the first
   * time opens at the same time of day rather than resetting. Read inside an effect at the moment
   * this page mounts its ScrollView - a plain prop would be captured at the parent's last render
   * and go stale as soon as the user scrolls without re-rendering the parent. Returns null before
   * any page has ever been scrolled, in which case we fall back to scrollToFirstItem.
   */
  getSharedOffset: () => number | null;
}

/**
 * One day's worth of Day Planner content: its own queries, boundary calc, and timeline.
 * Mounted permanently for every cruise day inside a PagerView, but only fetches once `enabled`
 * and only builds its timeline once `renderTimeline` - the parent stages both outward from the
 * initially-viewed day so we don't fire every day's queries, or build every day's views, at once.
 */
const DayPlannerPageComponent = ({
  cruiseDay,
  isActive,
  enabled,
  renderTimeline,
  onLoaded,
  onActiveControlsChange,
  onRegisterScrollController,
  onScrollSettled,
  getSharedOffset,
}: DayPlannerPageProps) => {
  const {startDate} = useCruise();
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();
  const scrollViewRef = useRef<ScrollView>(null);
  const hasPositioned = useRef(false);
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

  /**
   * Imperative scroll helper. No echo guard is needed: the only scroll callbacks wired up are the
   * drag/momentum end events, which an unanimated scrollTo doesn't emit at all, and the offsets
   * pushed in from the parent only ever land on inactive pages, which ignore them anyway. A
   * latching "is programmatic" flag would risk sticking and swallowing a real gesture instead.
   */
  const scrollTo = useCallback((offsetY: number, animated: boolean) => {
    scrollViewRef.current?.scrollTo({y: offsetY, animated});
  }, []);

  const scrollToNow = useCallback(() => {
    scrollTo(getScrollOffsetForTimeOfDay(boatTimeZoneID, dayStart), true);
  }, [boatTimeZoneID, dayStart, getScrollOffsetForTimeOfDay, scrollTo]);

  const scrollToFirstItem = useCallback(() => {
    scrollTo(getScrollOffsetForFirstItem(dayPlannerItems, dayStart), true);
  }, [dayPlannerItems, dayStart, getScrollOffsetForFirstItem, scrollTo]);

  const refresh = useCallback(async () => {
    const refreshes: Promise<any>[] = [refetchEvents()];
    if (!preRegistrationMode) {
      refreshes.push(refetchLfgJoined(), refetchPersonalEvents());
    }
    await Promise.all(refreshes);
  }, [refetchEvents, refetchLfgJoined, refetchPersonalEvents, preRegistrationMode]);

  /**
   * Position this page once, the first time it actually has a timeline to position: carry over
   * whatever offset the last-scrolled day came to rest at (so arriving here keeps the same time
   * of day in view), falling back to the smart scrollToFirstItem default before anything has been
   * scrolled. The offset is pulled here rather than taken as a prop so it reflects the user's
   * latest scroll even if the parent hasn't re-rendered since. hasPositioned keeps socket/refetch
   * updates that rebuild dayPlannerItems from jumping the timeline out from under the user.
   */
  useEffect(() => {
    if (showLoading || !renderTimeline || hasPositioned.current || !scrollViewRef.current) {
      return;
    }
    const rafId = requestAnimationFrame(() => {
      const sharedOffset = getSharedOffset();
      if (sharedOffset !== null) {
        scrollTo(sharedOffset, false);
      } else {
        scrollToFirstItem();
      }
      hasPositioned.current = true;
    });
    return () => cancelAnimationFrame(rafId);
  }, [showLoading, renderTimeline, getSharedOffset, scrollToFirstItem, scrollTo]);

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
   * Expose an imperative scrollTo regardless of active state, so the parent can align this page's
   * vertical position with the active one while it's still off-screen - ready before a swipe
   * brings it into view.
   */
  useEffect(() => {
    onRegisterScrollController({
      scrollTo: offsetY => scrollTo(offsetY, false),
    });
    return () => onRegisterScrollController(null);
  }, [onRegisterScrollController, scrollTo]);

  /**
   * Record the resting offset after a user scroll. Wired to the drag/momentum end events rather
   * than a throttled onScroll so this costs two callbacks per gesture instead of one per frame.
   */
  const handleScrollSettled = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!isActive) {
        return;
      }
      onScrollSettled(event.nativeEvent.contentOffset.y);
    },
    [isActive, onScrollSettled],
  );

  if (showLoading || !renderTimeline) {
    return (
      <View style={commonStyles.flex}>
        {showLoading && (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size={'large'} />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={commonStyles.flex}>
      <DayPlannerTimelineView
        ref={scrollViewRef}
        items={dayPlannerItems}
        dayStart={dayStart}
        dayEnd={dayEnd}
        timeZoneID={boatTimeZoneID}
        selectedCruiseDay={cruiseDay}
        onScrollSettled={handleScrollSettled}
      />
    </View>
  );
};

export const DayPlannerPage = React.memo(DayPlannerPageComponent);
