import React, {useEffect, useMemo, useRef} from 'react';
import {RefreshControlProps, ScrollView, View} from 'react-native';

import {DayPlannerTimelineView} from '#src/Components/Views/Schedule/DayPlannerTimelineView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useDayPlanner} from '#src/Context/Contexts/DayPlannerContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {EventData, FezData} from '#src/Structs/ControllerStructs';
import {DayPlannerItem} from '#src/Types/DayPlanner';

interface ScheduleOverlapDayPlannerViewProps {
  /** The already-filtered overlapping events and fezzes to place on the timeline. */
  items: (EventData | FezData)[];
  /** The cruise day (1-indexed) the overlapping items belong to. */
  cruiseDay: number;
  /** Pull-to-refresh control for the timeline's scroll view. */
  refreshControl: React.ReactElement<RefreshControlProps>;
}

/**
 * Day Planner timeline of just the overlapping items for the Overlapping Events screen. Reuses
 * the Day Planner timeline for one cruise day, scrolled once on mount to the first item.
 */
export const ScheduleOverlapDayPlannerView = ({
  items,
  cruiseDay,
  refreshControl,
}: ScheduleOverlapDayPlannerViewProps) => {
  const {startDate} = useCruise();
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();
  const {tzAtTime} = useTimeZone();
  const {fromEvent, fromFez, getDayBoundaries, getScrollOffsetForFirstItem} = useDayPlanner();
  const scrollViewRef = useRef<ScrollView>(null);
  const hasPositioned = useRef(false);

  // Convert, dedupe by id (the open and joined LFG queries can return the same fez), and sort by start time.
  const plannerItems = useMemo(() => {
    const seenIds = new Set<string>();
    const converted: DayPlannerItem[] = [];
    items.forEach(item => {
      const plannerItem = 'fezID' in item ? fromFez(item) : fromEvent(item);
      if (plannerItem && !seenIds.has(plannerItem.id)) {
        seenIds.add(plannerItem.id);
        converted.push(plannerItem);
      }
    });
    return converted.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [items, fromEvent, fromFez]);

  // The screen derives cruiseDay from calcCruiseDayTime, which hardcodes a 3AM day start regardless of the
  // enableLateDayFlip setting. Always use the 3AM-to-3AM window here: a midnight window would drop a 1:30AM
  // event (which belongs to the prior cruise day) and items just past midnight off the timeline entirely.
  const preliminaryBoundaries = useMemo(() => {
    return getDayBoundaries(startDate, cruiseDay, true, appConfig.portTimeZoneID);
  }, [startDate, cruiseDay, appConfig.portTimeZoneID, getDayBoundaries]);

  const boatTimeZoneID = useMemo(() => {
    return tzAtTime(preliminaryBoundaries.dayStart);
  }, [preliminaryBoundaries.dayStart, tzAtTime]);

  const {dayStart, dayEnd} = useMemo(() => {
    return getDayBoundaries(startDate, cruiseDay, true, boatTimeZoneID);
  }, [startDate, cruiseDay, boatTimeZoneID, getDayBoundaries]);

  /**
   * Position once on mount so the overlapping block is in view immediately. hasPositioned keeps
   * refetches that rebuild the items from yanking the scroll position away from the user.
   */
  useEffect(() => {
    if (hasPositioned.current || !scrollViewRef.current) {
      return;
    }
    const rafId = requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({y: getScrollOffsetForFirstItem(plannerItems, dayStart), animated: false});
      hasPositioned.current = true;
    });
    return () => cancelAnimationFrame(rafId);
  }, [plannerItems, dayStart, getScrollOffsetForFirstItem]);

  return (
    <View style={commonStyles.flex}>
      <DayPlannerTimelineView
        ref={scrollViewRef}
        items={plannerItems}
        dayStart={dayStart}
        dayEnd={dayEnd}
        timeZoneID={boatTimeZoneID}
        selectedCruiseDay={cruiseDay}
        refreshControl={refreshControl}
      />
    </View>
  );
};
