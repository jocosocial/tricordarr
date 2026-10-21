import {InfiniteData} from '@tanstack/react-query';
import {parseISO} from 'date-fns';
import moment from 'moment-timezone';
import React, {PropsWithChildren} from 'react';

import {
  COMPACT_THEME_DURATION_MINUTES,
  DAY_PLANNER_CONFIG,
  DayPlannerContext,
  DayPlannerContextType,
} from '#src/Context/Contexts/DayPlannerContext';
import {EventType} from '#src/Enums/EventType';
import {FezType} from '#src/Enums/FezType';
import {getTimePartsInTz} from '#src/Libraries/DateTime';
import {EventData, FezData, FezListData} from '#src/Structs/ControllerStructs';
import {DayPlannerColor, DayPlannerItem, DayPlannerItemWithLayout, DayPlannerThemeColors} from '#src/Types/DayPlanner';

const dayMinutesMax = DAY_PLANNER_CONFIG.TOTAL_HOURS * 60;

/**
 * Determine the color for a Day Planner item based on its type, title, and eventType.
 * Matches the color scheme used in ScheduleDayScreen, with special cases for red/gold team events.
 */
const getDayPlannerColor = (item: {
  type: 'event' | 'lfg' | 'personalEvent';
  title: string;
  eventType?: string;
}): DayPlannerColor => {
  if (item.type === 'event') {
    // Check for shadow events first (matches EventCard behavior)
    if (item.eventType === EventType.shadow) {
      return 'shadow';
    }
    // Check for team events by title matching (special case kept from web app)
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
 * Get the background color for a Day Planner card based on its color type.
 * Matches the color scheme used in ScheduleDayScreen (EventCard and FezCard).
 */
const getBackgroundColor = (color: DayPlannerColor, colors: DayPlannerThemeColors): string => {
  switch (color) {
    case 'redTeam':
      return colors.jocoRed;
    case 'goldTeam':
      return colors.twitarrYellow;
    case 'shadow':
      return colors.jocoPurple;
    case 'schedule':
      return colors.twitarrNeutralButton;
    case 'lfg':
      return colors.outline;
    case 'personalEvent':
      return colors.twitarrOrange;
  }
};

/**
 * Get the text color for a Day Planner card based on its color type.
 * Gold team needs dark text for contrast; all others use white.
 */
const getTextColor = (color: DayPlannerColor, colors: DayPlannerThemeColors): string => {
  switch (color) {
    case 'goldTeam':
      return colors.onTwitarrYellow;
    default:
      return colors.constantWhite;
  }
};

/**
 * Convert an EventData to a DayPlannerItem.
 */
const fromEvent = (event: EventData): DayPlannerItem => {
  const type = 'event';
  return {
    id: event.eventID,
    title: event.title,
    startTime: parseISO(event.startTime),
    endTime: parseISO(event.endTime),
    type,
    color: getDayPlannerColor({type, title: event.title, eventType: event.eventType}),
    location: event.location,
    eventData: event,
  };
};

/**
 * Convert a FezData to a DayPlannerItem.
 */
const fromFez = (fez: FezData): DayPlannerItem | null => {
  if (!fez.startTime || !fez.endTime) {
    return null;
  }
  const type = FezType.isLFGType(fez.fezType) ? 'lfg' : 'personalEvent';
  return {
    id: fez.fezID,
    title: fez.title,
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
const buildDayPlannerItems = (
  eventData?: EventData[],
  lfgData?: InfiniteData<FezListData>,
  personalEventData?: InfiniteData<FezListData>,
): DayPlannerItem[] => {
  const items: DayPlannerItem[] = [];

  // Add events
  if (eventData) {
    eventData.forEach(event => {
      items.push(fromEvent(event));
    });
  }

  // Add LFGs
  if (lfgData?.pages) {
    lfgData.pages.forEach(page => {
      page.fezzes.forEach(fez => {
        const item = fromFez(fez);
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
        const item = fromFez(fez);
        if (item) {
          items.push(item);
        }
      });
    });
  }

  // Deduplicate by ID in case the same fez/event appears in multiple sources
  const seenIds = new Set<string>();
  const dedupedItems: DayPlannerItem[] = [];
  for (const item of items) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      dedupedItems.push(item);
    }
  }

  // Sort by start time
  return dedupedItems.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};

/**
 * Clip an item's display times to the day boundaries and calculate display properties.
 * Returns null if the item doesn't intersect the display window.
 */
const adjustItemForDisplay = (
  item: DayPlannerItem,
  dayStart: Date,
  dayEnd: Date,
  compactThemeEvents?: boolean,
): DayPlannerItem | null => {
  // Check if item intersects the day's display window
  if (item.endTime <= dayStart || item.startTime >= dayEnd) {
    return null;
  }

  // Clone the item with adjusted times
  const adjustedItem = {...item};

  // Cap "Theme:" events to a short display duration so all-day themes don't dominate the timeline
  if (compactThemeEvents && item.title.startsWith('Theme:')) {
    const compactMs = COMPACT_THEME_DURATION_MINUTES * 60 * 1000;
    const actualDurationMs = item.endTime.getTime() - item.startTime.getTime();
    if (actualDurationMs > compactMs) {
      adjustedItem.endTime = new Date(item.startTime.getTime() + compactMs);
      adjustedItem.compactedTheme = true;
    }
  }

  // Extend very short events for visibility
  const durationMs = adjustedItem.endTime.getTime() - adjustedItem.startTime.getTime();
  const minDurationMs = DAY_PLANNER_CONFIG.MIN_EVENT_DURATION_MINUTES * 60 * 1000;
  if (durationMs < minDurationMs) {
    adjustedItem.endTime = new Date(adjustedItem.startTime.getTime() + minDurationMs);
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
const calculateItemLayout = (
  items: DayPlannerItem[],
  dayStart: Date,
  dayEnd: Date,
  compactThemeEvents?: boolean,
): DayPlannerItemWithLayout[] => {
  // Adjust items for display and filter out non-intersecting ones
  const adjustedItems = items
    .map(item => adjustItemForDisplay(item, dayStart, dayEnd, compactThemeEvents))
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
const generateTimeSlotLabels: DayPlannerContextType['generateTimeSlotLabels'] = (dayStart, timeZoneID) => {
  const slots: ReturnType<DayPlannerContextType['generateTimeSlotLabels']> = [];
  const totalSlots = DAY_PLANNER_CONFIG.TOTAL_HOURS * DAY_PLANNER_CONFIG.SLOTS_PER_HOUR;

  for (let i = 0; i < totalSlots; i++) {
    const slotTime = new Date(dayStart.getTime() + i * DAY_PLANNER_CONFIG.MINUTES_PER_ROW * 60 * 1000);
    const hours = timeZoneID ? moment(slotTime).tz(timeZoneID).hours() : slotTime.getHours();
    const slotInHour = i % DAY_PLANNER_CONFIG.SLOTS_PER_HOUR;

    // Determine slot type based on position within the hour
    let slotType: (typeof slots)[number]['slotType'];
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
const getDayBoundaries = (
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
const getTimelineHeight = (): number => {
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
const getScrollOffsetForFirstItem = (items: {startTime: Date}[], dayStart: Date): number => {
  if (items.length === 0) return 0;
  // Use first item that starts on or after dayStart (items before day boundary yield negative offset and clamp to 0).
  const firstOnOrAfterDayStart = items.find(item => item.startTime >= dayStart) ?? items[0];
  const minutesFromDayStart = (firstOnOrAfterDayStart.startTime.getTime() - dayStart.getTime()) / (1000 * 60);
  const offset = (minutesFromDayStart / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT;
  const viewOffset = DAY_PLANNER_CONFIG.ROW_HEIGHT * 2;
  return Math.max(0, offset - viewOffset);
};

/**
 * Minutes from day start for "now" for the now-line and scroll-to-now.
 * Uses boat timezone for both "now" and "day start" so the line matches
 * Schedule day Soon/Now markers (event/boat TZ), not device local time.
 * Wall-clock mapping (not elapsed time) so scroll-to-now on other cruise days
 * still jumps to "this time of day".
 *
 * @param timeZoneID IANA timezone of the boat for the viewed day
 * @param dayStart Start of the viewed day's timeline (e.g. 3AM in boat TZ)
 * @param now Current instant
 * @returns Minutes from day start, or null if outside the 24-hour window
 */
export const getMinutesFromDayStartForNow = (timeZoneID: string, dayStart: Date, now: Date): number | null => {
  const {hours: nowH, minutes: nowM} = getTimePartsInTz(now, timeZoneID);
  const {hours: startH, minutes: startM} = getTimePartsInTz(dayStart, timeZoneID);
  let minutesFromDayStart = (nowH - startH) * 60 + (nowM - startM);

  if (minutesFromDayStart < 0) {
    minutesFromDayStart += dayMinutesMax;
  }
  if (minutesFromDayStart >= dayMinutesMax) {
    return null;
  }
  return minutesFromDayStart;
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
const getScrollOffsetForTimeOfDay = (timeZoneID: string, dayStart: Date): number => {
  const minutesFromDayStart = getMinutesFromDayStartForNow(timeZoneID, dayStart, new Date());
  const clamped = minutesFromDayStart === null ? 0 : Math.min(minutesFromDayStart, dayMinutesMax);

  const offset = (clamped / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT;
  const viewOffset = DAY_PLANNER_CONFIG.ROW_HEIGHT * 2;
  return Math.max(0, offset - viewOffset);
};

const dayPlannerContextValue: DayPlannerContextType = {
  getDayPlannerColor,
  getBackgroundColor,
  getTextColor,
  fromEvent,
  fromFez,
  buildDayPlannerItems,
  calculateItemLayout,
  generateTimeSlotLabels,
  getDayBoundaries,
  getTimelineHeight,
  getScrollOffsetForFirstItem,
  getMinutesFromDayStartForNow,
  getScrollOffsetForTimeOfDay,
};

export const DayPlannerProvider = ({children}: PropsWithChildren) => {
  return <DayPlannerContext.Provider value={dayPlannerContextValue}>{children}</DayPlannerContext.Provider>;
};
