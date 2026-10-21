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
  /** True when this item was capped to COMPACT_THEME_DURATION_MINUTES for display. */
  compactedTheme?: boolean;
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
