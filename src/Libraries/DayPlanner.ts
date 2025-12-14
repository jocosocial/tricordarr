import {InfiniteData} from '@tanstack/react-query';
import {parseISO} from 'date-fns';

import {FezType} from '#src/Enums/FezType';
import {EventData, FezData, FezListData} from '#src/Structs/ControllerStructs';

/**
 * Color categories for Day Planner items.
 * Matches the web app's color scheme from SitePrivateEventController.swift.
 */
export type DayPlannerColor = 'redTeam' | 'goldTeam' | 'schedule' | 'lfg' | 'personalEvent';

/**
 * A unified representation of an item in the Day Planner.
 * Can represent an Event, LFG, or Personal/Private Event.
 */
export interface DayPlannerItem {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'event' | 'lfg' | 'personalEvent';
  color: DayPlannerColor;
  cancelled?: boolean;
  location?: string;
  // Original data for navigation
  eventData?: EventData;
  fezData?: FezData;
}

/**
 * A DayPlannerItem with layout information computed for rendering.
 */
export interface DayPlannerItemWithLayout extends DayPlannerItem {
  // Layout properties calculated at render time
  columnIndex: number;
  totalColumns: number;
  topOffset: number; // pixels from top of timeline
  height: number; // height in pixels
}

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
 * Determine the color for a Day Planner item based on its type and title.
 * Matches the logic from SitePrivateEventController.swift.
 */
export const getDayPlannerColor = (item: {type: 'event' | 'lfg' | 'personalEvent'; title: string}): DayPlannerColor => {
  if (item.type === 'event') {
    // Check for team events by title matching
    if (item.title.toLowerCase().includes('gold team')) {
      return 'goldTeam';
    }
    if (item.title.toLowerCase().includes('red team')) {
      return 'redTeam';
    }
    return 'schedule';
  }
  if (item.type === 'lfg') {
    return 'lfg';
  }
  return 'personalEvent';
};

/**
 * Convert an EventData to a DayPlannerItem.
 */
const eventToDayPlannerItem = (event: EventData): DayPlannerItem => {
  const type = 'event';
  return {
    id: event.eventID,
    title: event.title,
    startTime: parseISO(event.startTime),
    endTime: parseISO(event.endTime),
    type,
    color: getDayPlannerColor({type, title: event.title}),
    location: event.location,
    eventData: event,
  };
};

/**
 * Convert a FezData to a DayPlannerItem.
 */
const fezToDayPlannerItem = (fez: FezData): DayPlannerItem | null => {
  if (!fez.startTime || !fez.endTime) {
    return null;
  }
  const type = FezType.isLFGType(fez.fezType) ? 'lfg' : 'personalEvent';
  return {
    id: fez.fezID,
    title: fez.cancelled ? `CANCELLED - ${fez.title}` : fez.title,
    startTime: parseISO(fez.startTime),
    endTime: parseISO(fez.endTime),
    type,
    color: getDayPlannerColor({type, title: fez.title}),
    cancelled: fez.cancelled,
    location: fez.location,
    fezData: fez,
  };
};

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
      items.push(eventToDayPlannerItem(event));
    });
  }

  // Add LFGs
  if (lfgData?.pages) {
    lfgData.pages.forEach(page => {
      page.fezzes.forEach(fez => {
        const item = fezToDayPlannerItem(fez);
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
        const item = fezToDayPlannerItem(fez);
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
const adjustItemForDisplay = (
  item: DayPlannerItem,
  dayStart: Date,
  dayEnd: Date,
): DayPlannerItem | null => {
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

  // Track groups of overlapping items
  let group: DayPlannerItem[] = [];
  let columnEndTimes: Date[] = [];
  let groupEndTime = new Date(0);
  const itemColumnMap = new Map<string, number>();

  for (const item of sorted) {
    // Check if this item starts after the current group ends
    if (groupEndTime <= item.startTime) {
      // Finalize the previous group - assign column counts
      for (const groupedItem of group) {
        // Column count already assigned via itemColumnMap
      }
      // Reset for new group
      columnEndTimes = [];
      groupEndTime = new Date(0);
      group = [];
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
    group.push(item);
  }

  // Calculate total columns for each item by finding max column used in overlapping items
  const result: DayPlannerItemWithLayout[] = [];
  
  for (const item of sorted) {
    // Find all items that overlap with this one
    const overlapping = sorted.filter(
      other =>
        other.startTime < item.endTime && other.endTime > item.startTime
    );
    const totalColumns = Math.max(...overlapping.map(o => (itemColumnMap.get(o.id) ?? 0) + 1));
    
    // Calculate pixel positions
    const minutesFromDayStart = (item.startTime.getTime() - dayStart.getTime()) / (1000 * 60);
    const durationMinutes = (item.endTime.getTime() - item.startTime.getTime()) / (1000 * 60);
    
    const topOffset = (minutesFromDayStart / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT;
    const height = Math.max(
      (durationMinutes / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT,
      DAY_PLANNER_CONFIG.MIN_EVENT_HEIGHT
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
 * Time slot type for distinguishing grid line styles.
 * - 'hour': Top of the hour (e.g., 1:00, 2:00) - gets a label and thick line
 * - 'halfHour': 30-minute mark (e.g., 1:30, 2:30) - gets a medium line
 * - 'quarter': 15/45-minute mark (e.g., 1:15, 1:45) - gets a thin line
 */
export type TimeSlotType = 'hour' | 'halfHour' | 'quarter';

/**
 * Generate time slot labels for the Day Planner timeline.
 * Returns an array of time slots with labels only on the hour marks.
 */
export const generateTimeSlotLabels = (dayStart: Date): {time: Date; label: string; slotType: TimeSlotType}[] => {
  const slots: {time: Date; label: string; slotType: TimeSlotType}[] = [];
  const totalSlots = DAY_PLANNER_CONFIG.TOTAL_HOURS * DAY_PLANNER_CONFIG.SLOTS_PER_HOUR;

  for (let i = 0; i < totalSlots; i++) {
    const slotTime = new Date(dayStart.getTime() + i * DAY_PLANNER_CONFIG.MINUTES_PER_ROW * 60 * 1000);
    const hours = slotTime.getHours();
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
 * Calculate the day start and end times for a given cruise day.
 * Day runs from 00:00 to 03:00 the next day (27 hours).
 */
export const getDayBoundaries = (cruiseStartDate: Date, cruiseDay: number): {dayStart: Date; dayEnd: Date} => {
  // cruiseDay is 1-indexed, so subtract 1 to get the offset
  const dayStart = new Date(cruiseStartDate);
  dayStart.setDate(dayStart.getDate() + cruiseDay - 1);
  dayStart.setHours(0, 0, 0, 0);

  // Day ends at 03:00 the next day (27 hours later)
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(DAY_PLANNER_CONFIG.TOTAL_HOURS, 0, 0, 0);

  console.log('[DayPlanner] getDayBoundaries:', {
    cruiseStartDate: cruiseStartDate.toISOString(),
    cruiseDay,
    dayStart: dayStart.toString(),
    dayEnd: dayEnd.toString(),
  });

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
 * This uses only the hour/minute of the current time, ignoring the date,
 * so it works correctly even when testing outside of cruise dates.
 * 
 * The timeline shows 27 hours: from 00:00 (midnight) to 03:00 the next day.
 * We simply map the current time of day to a position on this timeline.
 * 
 * @param now The current date/time
 * @param dayStart The start of the day being displayed (for logging only)
 * @param dayEnd The end of the day being displayed (for logging only)
 * @returns The scroll offset in pixels
 */
export const getScrollOffsetForTime = (now: Date, dayStart: Date, dayEnd: Date): number => {
  // Extract just the time-of-day from "now" (hours and minutes)
  const nowHours = now.getHours();
  const nowMinutes = now.getMinutes();
  
  // Calculate minutes from midnight (00:00)
  // The timeline starts at 00:00, so we just use hours * 60 + minutes directly
  const minutesFromMidnight = nowHours * 60 + nowMinutes;
  
  console.log('[DayPlanner] getScrollOffsetForTime:', {
    now: now.toString(),
    nowHours,
    nowMinutes,
    minutesFromMidnight,
    dayStart: dayStart.toString(),
    dayEnd: dayEnd.toString(),
  });
  
  // Convert to pixel offset
  // Each 15-minute slot is ROW_HEIGHT pixels tall
  const offset = (minutesFromMidnight / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT;
  
  // Subtract some offset so the current time appears near the top of the view, not at the very top
  const viewOffset = DAY_PLANNER_CONFIG.ROW_HEIGHT * 2; // Show ~1 hour before current time
  
  const finalOffset = Math.max(0, offset - viewOffset);
  
  console.log('[DayPlanner] getScrollOffsetForTime result:', {
    rawOffset: offset,
    viewOffset,
    finalOffset,
    timelineHeight: getTimelineHeight(),
    percentDown: ((finalOffset / getTimelineHeight()) * 100).toFixed(1) + '%',
  });
  
  return finalOffset;
};
