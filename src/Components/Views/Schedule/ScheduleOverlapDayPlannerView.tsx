import React, {useMemo} from 'react';
import {RefreshControlProps, View} from 'react-native';

import {DayPlannerTimelineView} from '#src/Components/Views/Schedule/DayPlannerTimelineView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
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
 * the Day Planner timeline, but the window spans only the hours of the items (first item at the
 * top) rather than a full day.
 */
export const ScheduleOverlapDayPlannerView = ({
  items,
  cruiseDay,
  refreshControl,
}: ScheduleOverlapDayPlannerViewProps) => {
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();
  const {tzAtTime} = useTimeZone();
  const {fromEvent, fromFez, getItemsTimelineWindow} = useDayPlanner();

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

  const boatTimeZoneID = useMemo(() => {
    return plannerItems.length > 0 ? tzAtTime(plannerItems[0].startTime) : appConfig.portTimeZoneID;
  }, [plannerItems, tzAtTime, appConfig.portTimeZoneID]);

  const timelineWindow = useMemo(() => {
    return getItemsTimelineWindow(plannerItems, boatTimeZoneID, appConfig.schedule.compactThemeEvents);
  }, [plannerItems, boatTimeZoneID, appConfig.schedule.compactThemeEvents, getItemsTimelineWindow]);

  if (!timelineWindow) {
    return null;
  }

  const {dayStart, dayEnd} = timelineWindow;

  return (
    <View style={commonStyles.flex}>
      {/* A changed window (e.g. after a filter) restarts at the top rather than keeping a scroll offset that now
          means a different time; refetches that keep the window keep the scroll position. */}
      <DayPlannerTimelineView
        key={`${dayStart.getTime()}-${dayEnd.getTime()}`}
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
