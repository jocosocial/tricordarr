import {parseISO} from 'date-fns';

import {EventType} from '#src/Enums/EventType';
import {FezType} from '#src/Enums/FezType';
import {EventData, FezData} from '#src/Structs/ControllerStructs';

/**
 * Color categories for Day Planner items.
 * Matches the color scheme used in ScheduleDayScreen, with special cases for red/gold team events.
 */
export type DayPlannerColor = 'redTeam' | 'goldTeam' | 'shadow' | 'schedule' | 'lfg' | 'personalEvent';

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
 * Time slot type for distinguishing grid line styles.
 * - 'hour': Top of the hour (e.g., 1:00, 2:00) - gets a label and thick line
 * - 'halfHour': 30-minute mark (e.g., 1:30, 2:30) - gets a medium line
 * - 'quarter': 15/45-minute mark (e.g., 1:15, 1:45) - gets a thin line
 */
export type TimeSlotType = 'hour' | 'halfHour' | 'quarter';

/**
 * Theme colors interface for Day Planner styling.
 * Represents the subset of theme colors used by Day Planner components.
 */
export interface DayPlannerThemeColors {
  jocoRed: string;
  twitarrYellow: string;
  twitarrNeutralButton: string;
  jocoPurple: string;
  outline: string;
  twitarrOrange: string;
  onTwitarrYellow: string;
  constantWhite: string;
}

export namespace DayPlannerItem {
  /**
   * Determine the color for a Day Planner item based on its type, title, and eventType.
   * Matches the color scheme used in ScheduleDayScreen, with special cases for red/gold team events.
   */
  export const getDayPlannerColor = (item: {
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
  export const getBackgroundColor = (color: DayPlannerColor, colors: DayPlannerThemeColors): string => {
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
   */
  export const getTextColor = (color: DayPlannerColor, colors: DayPlannerThemeColors): string => {
    // Gold team needs dark text for contrast
    if (color === 'goldTeam') {
      return colors.onTwitarrYellow;
    }
    return colors.constantWhite;
  };

  /**
   * Convert an EventData to a DayPlannerItem.
   */
  export const fromEvent = (event: EventData): DayPlannerItem => {
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
  export const fromFez = (fez: FezData): DayPlannerItem | null => {
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
}
