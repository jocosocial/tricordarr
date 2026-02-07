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
  // Total hours displayed (from 00:00 to 03:00 next day = 27 hours)
  TOTAL_HOURS: 27,
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
 * Day runs from 00:00 to either 24:00 (midnight) or 03:00 the next day (27 hours),
 * depending on the enableLateDayFlip setting.
 *
 * @param cruiseStartDate - The start date of the cruise
 * @param cruiseDay - The cruise day (1-indexed)
 * @param enableLateDayFlip - If true, day extends to 03:00 next day (27 hours). If false, day ends at midnight (24 hours).
 * @param timeZoneID - IANA timezone for the boat (e.g. America/New_York). Day boundaries are midnight in this zone.
 */
export const getDayBoundaries = (
  cruiseStartDate: Date,
  cruiseDay: number,
  enableLateDayFlip: boolean,
  timeZoneID: string,
): {dayStart: Date; dayEnd: Date} => {
  const endHour = enableLateDayFlip ? DAY_PLANNER_CONFIG.TOTAL_HOURS : 24;
  const dayStart = moment(cruiseStartDate)
    .tz(timeZoneID)
    .add(cruiseDay - 1, 'days')
    .startOf('day')
    .toDate();
  const dayEnd = moment(cruiseStartDate)
    .tz(timeZoneID)
    .add(cruiseDay - 1, 'days')
    .add(endHour, 'hours')
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
 * Calculate the scroll offset in pixels for the current time of day.
 *
 * The timeline shows 27 hours: from 00:00 (midnight) to 03:00 the next day.
 * When dayStart is provided, we can correctly handle the extended hours (00:00-03:00)
 * that fall on the next calendar day by adding 24 hours to the offset.
 *
 * @param now The current date/time
 * @param dayStart Optional start of the viewed day's timeline. When provided, enables
 *                 correct positioning for times in the extended hours (next calendar day).
 * @returns The scroll offset in pixels
 */
export const getScrollOffsetForTime = (now: Date, dayStart?: Date): number => {
  // Extract just the time-of-day from "now" (hours and minutes)
  const nowHours = now.getHours();
  const nowMinutes = now.getMinutes();

  // Calculate minutes from midnight (00:00)
  let minutesFromMidnight = nowHours * 60 + nowMinutes;

  // If dayStart is provided and now is on a later calendar date,
  // we're in the extended hours (00:00-03:00 next day) and need to add 24 hours
  if (dayStart) {
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayStartDate = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate());
    if (nowDate.getTime() > dayStartDate.getTime()) {
      minutesFromMidnight += 24 * 60; // Add 24 hours worth of minutes
    }
  }

  // Convert to pixel offset
  // Each 15-minute slot is ROW_HEIGHT pixels tall
  const offset = (minutesFromMidnight / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT;

  // Subtract some offset so the current time appears near the top of the view, not at the very top
  const viewOffset = DAY_PLANNER_CONFIG.ROW_HEIGHT * 2; // Show ~1 hour before current time

  const finalOffset = Math.max(0, offset - viewOffset);

  return finalOffset;
};
