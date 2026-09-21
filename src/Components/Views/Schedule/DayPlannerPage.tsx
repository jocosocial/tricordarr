import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {ScrollView, View} from 'react-native';
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

interface DayPlannerPageProps {
  cruiseDay: number;
  isActive: boolean;
  onActiveControlsChange: (controls: DayPlannerPageControls | null) => void;
}

/**
 * One day's worth of Day Planner content: its own queries, boundary calc, and timeline.
 * Rendered 3-up (prev/current/next) inside a PagerView so adjacent days are pre-fetched
 * and ready by the time a swipe lands on them.
 */
export const DayPlannerPage = ({cruiseDay, isActive, onActiveControlsChange}: DayPlannerPageProps) => {
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
      enabled: !preRegistrationMode,
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
      enabled: !preRegistrationMode,
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

  const showLoading = isEventLoading || isLfgJoinedLoading || isPersonalEventLoading;

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
   * Auto-scroll to the first item on initial load and when this slot's cruiseDay changes.
   * Gated by lastAutoScrolledCruiseDay so socket/refetch updates that rebuild
   * dayPlannerItems (and thus scrollToFirstItem) do not jump the timeline.
   */
  useEffect(() => {
    if (showLoading || !scrollViewRef.current) {
      return;
    }
    if (lastAutoScrolledCruiseDay.current === cruiseDay) {
      return;
    }
    const rafId = requestAnimationFrame(() => {
      scrollToFirstItem();
      lastAutoScrolledCruiseDay.current = cruiseDay;
    });
    return () => cancelAnimationFrame(rafId);
  }, [showLoading, cruiseDay, scrollToFirstItem]);

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
        />
      )}
    </View>
  );
};
