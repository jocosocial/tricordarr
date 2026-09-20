import {InfiniteData} from '@tanstack/react-query';
import {createContext, useContext} from 'react';

import {EventData, FezData, FezListData} from '#src/Structs/ControllerStructs';
import {
  DayPlannerColor,
  DayPlannerItem,
  DayPlannerItemWithLayout,
  DayPlannerThemeColors,
  TimeSlotType,
} from '#src/Types/DayPlanner';

/**
 * Configuration for the Day Planner timeline.
 */
export const DAY_PLANNER_CONFIG = {
  // Each row represents 15 minutes
  MINUTES_PER_ROW: 15,
  // Height of each 15-minute row in pixels
  ROW_HEIGHT: 25,
  // Total hours displayed (24 hours, always)
  TOTAL_HOURS: 24,
  // Minimum event height to ensure visibility of short events
  MIN_EVENT_HEIGHT: 40,
  // Minimum event duration in minutes (events shorter than this will be extended for display)
  MIN_EVENT_DURATION_MINUTES: 15,
  // Slots per hour (60 / MINUTES_PER_ROW)
  SLOTS_PER_HOUR: 4,
} as const;

/** Display duration for compacted "Theme:" events on the Day Planner timeline. */
export const COMPACT_THEME_DURATION_MINUTES = 90;
/** Minutes at the bottom of a compacted theme card that fade from opaque to transparent. */
export const COMPACT_THEME_FADE_MINUTES = 30;

export interface DayPlannerContextType {
  getDayPlannerColor: (item: {
    type: 'event' | 'lfg' | 'personalEvent';
    title: string;
    eventType?: string;
  }) => DayPlannerColor;
  getBackgroundColor: (color: DayPlannerColor, colors: DayPlannerThemeColors) => string;
  getTextColor: (color: DayPlannerColor, colors: DayPlannerThemeColors) => string;
  fromEvent: (event: EventData) => DayPlannerItem;
  fromFez: (fez: FezData) => DayPlannerItem | null;
  buildDayPlannerItems: (
    eventData?: EventData[],
    lfgData?: InfiniteData<FezListData>,
    personalEventData?: InfiniteData<FezListData>,
  ) => DayPlannerItem[];
  calculateItemLayout: (
    items: DayPlannerItem[],
    dayStart: Date,
    dayEnd: Date,
    compactThemeEvents?: boolean,
  ) => DayPlannerItemWithLayout[];
  generateTimeSlotLabels: (
    dayStart: Date,
    timeZoneID?: string,
  ) => {time: Date; label: string; slotType: TimeSlotType}[];
  getDayBoundaries: (
    cruiseStartDate: Date,
    cruiseDay: number,
    enableLateDayFlip: boolean,
    timeZoneID: string,
  ) => {dayStart: Date; dayEnd: Date};
  getTimelineHeight: () => number;
  getScrollOffsetForFirstItem: (items: {startTime: Date}[], dayStart: Date) => number;
  getMinutesFromDayStartForNow: (timeZoneID: string, dayStart: Date, now: Date) => number | null;
  getScrollOffsetForTimeOfDay: (timeZoneID: string, dayStart: Date) => number;
}

export const DayPlannerContext = createContext(<DayPlannerContextType>{});

/**
 * Day Planner domain logic: building/laying out timeline items, time slot labels, day
 * boundaries, and per-item colors. Provided as a context (rather than a plain hook) so
 * consumers get stable function references across renders - see AppImageContext.ts for
 * the full rationale. This one matters in practice: ScheduleDayPlannerScreen chains
 * `getScrollOffsetForFirstItem`/`getScrollOffsetForTimeOfDay` through `useCallback`s into
 * a further `useEffect`, so an unstable function here previously meant that effect never
 * settled.
 */
export const useDayPlanner = () => useContext(DayPlannerContext);
