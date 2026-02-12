import {InfiniteData} from '@tanstack/react-query';
import moment from 'moment-timezone';

import {EventData, FezListData} from '#src/Structs/ControllerStructs';
import {DayPlannerItem, DayPlannerItemWithLayout, TimeSlotType} from '#src/Types/DayPlanner';

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

/**
 * Build a list of DayPlannerItems from various data sources.
 * Combines events, LFGs, and personal events into a single sorted list.
 */
export const buildDayPlannerItems = (
  eventData?: EventData[],
  lfgData?: InfiniteData<FezListData>,
  personalEventData?: InfiniteData<FezListData>,
): DayPlannerItem[] => {
  const items: DayPlannerItem[] = [];

  // Add events
  if (eventData) {
    eventData.forEach(event => {
      items.push(DayPlannerItem.fromEvent(event));
    });
  }

  // Add LFGs
  if (lfgData?.pages) {
    lfgData.pages.forEach(page => {
      page.fezzes.forEach(fez => {
        const item = DayPlannerItem.fromFez(fez);
        if (item) {
          items.push(item);
        }
      });
    });
  }

  // Add personal events
  if (personalEventData?.pages) {
    personalEventData.pages.forEach(page => {
      page.fezzes.forEach(fez => {
        const item = DayPlannerItem.fromFez(fez);
        if (item) {
          items.push(item);
        }
      });
    });
  }

  // Sort by start time
  return items.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};

/**
 * Clip an item's display times to the day boundaries and calculate display properties.
 * Returns null if the item doesn't intersect the display window.
 */
const adjustItemForDisplay = (item: DayPlannerItem, dayStart: Date, dayEnd: Date): DayPlannerItem | null => {
  // Check if item intersects the day's display window
  if (item.endTime <= dayStart || item.startTime >= dayEnd) {
    return null;
  }

  // Clone the item with adjusted times
  const adjustedItem = {...item};

  // Extend very short events for visibility
  const durationMs = item.endTime.getTime() - item.startTime.getTime();
  const minDurationMs = DAY_PLANNER_CONFIG.MIN_EVENT_DURATION_MINUTES * 60 * 1000;
  if (durationMs < minDurationMs) {
    adjustedItem.endTime = new Date(item.startTime.getTime() + minDurationMs);
  }

  // Clip to day boundaries
  if (adjustedItem.startTime < dayStart) {
    adjustedItem.startTime = dayStart;
  }
  if (adjustedItem.endTime > dayEnd) {
    adjustedItem.endTime = dayEnd;
  }

  return adjustedItem;
};

/**
 * Calculate layout information for overlapping items.
 * Groups overlapping items and assigns column positions.
 * Ported from SitePrivateEventController.swift lines 290-340.
 */
export const calculateItemLayout = (
  items: DayPlannerItem[],
  dayStart: Date,
  dayEnd: Date,
): DayPlannerItemWithLayout[] => {
  // Adjust items for display and filter out non-intersecting ones
  const adjustedItems = items
    .map(item => adjustItemForDisplay(item, dayStart, dayEnd))
    .filter((item): item is DayPlannerItem => item !== null);

  // Sort by start time
  const sorted = [...adjustedItems].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Track column assignments for overlapping items
  let columnEndTimes: Date[] = [];
  let groupEndTime = new Date(0);
  const itemColumnMap = new Map<string, number>();

  for (const item of sorted) {
    // Check if this item starts after the current group ends - reset columns
    if (groupEndTime <= item.startTime) {
      columnEndTimes = [];
      groupEndTime = new Date(0);
    }

    // Find an available column or create a new one
    let columnIndex = columnEndTimes.findIndex(endTime => endTime <= item.startTime);
    if (columnIndex === -1) {
      // Need a new column
      columnIndex = columnEndTimes.length;
      columnEndTimes.push(item.endTime);
    } else {
      // Reuse existing column
      columnEndTimes[columnIndex] = item.endTime;
    }

    itemColumnMap.set(item.id, columnIndex);
    groupEndTime = new Date(Math.max(groupEndTime.getTime(), item.endTime.getTime()));
  }

  // Calculate total columns for each item by finding max column used in overlapping items
  const result: DayPlannerItemWithLayout[] = [];

  for (const item of sorted) {
    // Find all items that overlap with this one
    const overlapping = sorted.filter(other => other.startTime < item.endTime && other.endTime > item.startTime);
    const totalColumns = Math.max(...overlapping.map(o => (itemColumnMap.get(o.id) ?? 0) + 1));

    // Calculate pixel positions
    const minutesFromDayStart = (item.startTime.getTime() - dayStart.getTime()) / (1000 * 60);
    const durationMinutes = (item.endTime.getTime() - item.startTime.getTime()) / (1000 * 60);

    const topOffset = (minutesFromDayStart / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT;
    const height = Math.max(
      (durationMinutes / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT,
      DAY_PLANNER_CONFIG.MIN_EVENT_HEIGHT,
    );

    result.push({
      ...item,
      columnIndex: itemColumnMap.get(item.id) ?? 0,
      totalColumns,
      topOffset,
      height,
    });
  }

  return result;
};

/**
 * Generate time slot labels for the Day Planner timeline.
 * Returns an array of time slots with labels only on the hour marks.
 * Timeline always shows 24 hours starting from dayStart.
 * When timeZoneID is provided, labels show the hour in that timezone (boat time); otherwise device local.
 */
export const generateTimeSlotLabels = (
  dayStart: Date,
  timeZoneID?: string,
): {time: Date; label: string; slotType: TimeSlotType}[] => {
  const slots: {time: Date; label: string; slotType: TimeSlotType}[] = [];
  const totalSlots = DAY_PLANNER_CONFIG.TOTAL_HOURS * DAY_PLANNER_CONFIG.SLOTS_PER_HOUR;

  for (let i = 0; i < totalSlots; i++) {
    const slotTime = new Date(dayStart.getTime() + i * DAY_PLANNER_CONFIG.MINUTES_PER_ROW * 60 * 1000);
    const hours = timeZoneID ? moment(slotTime).tz(timeZoneID).hours() : slotTime.getHours();
    const slotInHour = i % DAY_PLANNER_CONFIG.SLOTS_PER_HOUR;

    // Determine slot type based on position within the hour
    let slotType: TimeSlotType;
    if (slotInHour === 0) {
      slotType = 'hour';
    } else if (slotInHour === 2) {
      slotType = 'halfHour';
    } else {
      slotType = 'quarter';
    }

    // Format: "12 PM", "1 AM", etc. - only show label on hour marks
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours < 12 ? 'AM' : 'PM';
    const label = slotType === 'hour' ? `${hour12} ${ampm}` : '';

    slots.push({
      time: slotTime,
      label,
      slotType,
    });
  }

  return slots;
};

/**
 * Calculate the day start and end times for a given cruise day in the boat timezone.
 * Day always runs for 24 hours:
 * - If enableLateDayFlip is false: 00:00 to 24:00 (midnight to midnight)
 * - If enableLateDayFlip is true: 03:00 to 03:00 next day (3AM to 3AM)
 *
 * @param cruiseStartDate - The start date of the cruise
 * @param cruiseDay - The cruise day (1-indexed)
 * @param enableLateDayFlip - If true, day runs from 3AM to 3AM. If false, midnight to midnight.
 * @param timeZoneID - IANA timezone for the boat (e.g. America/New_York).
 */
export const getDayBoundaries = (
  cruiseStartDate: Date,
  cruiseDay: number,
  enableLateDayFlip: boolean,
  timeZoneID: string,
): {dayStart: Date; dayEnd: Date} => {
  const startHour = enableLateDayFlip ? 3 : 0;
  const dayStart = moment(cruiseStartDate)
    .tz(timeZoneID)
    .add(cruiseDay - 1, 'days')
    .startOf('day')
    .add(startHour, 'hours')
    .toDate();
  const dayEnd = moment(cruiseStartDate)
    .tz(timeZoneID)
    .add(cruiseDay - 1, 'days')
    .startOf('day')
    .add(startHour + DAY_PLANNER_CONFIG.TOTAL_HOURS, 'hours')
    .toDate();

  return {dayStart, dayEnd};
};

/**
 * Get the total height of the timeline in pixels.
 */
export const getTimelineHeight = (): number => {
  return DAY_PLANNER_CONFIG.TOTAL_HOURS * DAY_PLANNER_CONFIG.SLOTS_PER_HOUR * DAY_PLANNER_CONFIG.ROW_HEIGHT;
};

/**
 * Get the scroll offset in pixels to show the first item near the top (with small padding).
 * Use when viewing a cruise day that is not today, so the list doesn't start at day start (e.g. 3AM).
 *
 * @param items Day planner items (should be sorted by start time)
 * @param dayStart The start of the viewed day's timeline
 * @returns The scroll offset in pixels (0 if no items)
 */
export const getScrollOffsetForFirstItem = (items: {startTime: Date}[], dayStart: Date): number => {
  if (items.length === 0) return 0;
  // Use first item that starts on or after dayStart (items before day boundary yield negative offset and clamp to 0).
  const firstOnOrAfterDayStart = items.find(item => item.startTime >= dayStart) ?? items[0];
  const minutesFromDayStart = (firstOnOrAfterDayStart.startTime.getTime() - dayStart.getTime()) / (1000 * 60);
  const offset = (minutesFromDayStart / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT;
  const viewOffset = DAY_PLANNER_CONFIG.ROW_HEIGHT * 2;
  return Math.max(0, offset - viewOffset);
};

/**
 * Calculate the scroll offset in pixels for "current time of day" in a timezone.
 * Use this when viewing "today" so the position is correct even when the cruise
 * calendar date is in the past (e.g. demo data).
 *
 * @param timeZoneID IANA timezone (e.g. boat timezone)
 * @param dayStart The start of the viewed day's timeline (hour in TZ defines start, e.g. 3AM)
 * @returns The scroll offset in pixels
 */
export const getScrollOffsetForTimeOfDay = (timeZoneID: string, dayStart: Date): number => {
  const nowInTz = moment().tz(timeZoneID);
  const startInTz = moment(dayStart).tz(timeZoneID);
  const minutesFromDayStart = (nowInTz.hours() - startInTz.hours()) * 60 + (nowInTz.minutes() - startInTz.minutes());

  const dayMinutesMax = DAY_PLANNER_CONFIG.TOTAL_HOURS * 60;
  const clamped = Math.max(0, Math.min(minutesFromDayStart, dayMinutesMax));

  const offset = (clamped / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT;
  const viewOffset = DAY_PLANNER_CONFIG.ROW_HEIGHT * 2;
  return Math.max(0, offset - viewOffset);
};

/**
 * Calculate the scroll offset in pixels for a given time relative to dayStart.
 * The timeline always shows 24 hours starting from dayStart.
 * Returns 0 when now is outside the displayed day (e.g. viewing a past/future cruise day).
 *
 * @param now The current date/time to calculate offset for
 * @param dayStart The start of the viewed day's timeline (either midnight or 3AM depending on late day flip)
 * @returns The scroll offset in pixels
 */
// export const getScrollOffsetForTime = (now: Date, dayStart: Date): number => {
//   const minutesFromDayStart = (now.getTime() - dayStart.getTime()) / (1000 * 60);

//   const dayMinutesMax = DAY_PLANNER_CONFIG.TOTAL_HOURS * 60;
//   if (minutesFromDayStart < 0 || minutesFromDayStart > dayMinutesMax) {
//     return 0;
//   }

//   const offset = (minutesFromDayStart / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT;
//   const viewOffset = DAY_PLANNER_CONFIG.ROW_HEIGHT * 2;
//   return Math.max(0, offset - viewOffset);
// };
