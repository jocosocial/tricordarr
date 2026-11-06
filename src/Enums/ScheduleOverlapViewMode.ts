/**
 * How the Overlapping Events screen lays out its items.
 */
export enum ScheduleOverlapViewMode {
  list = 'list',
  dayPlanner = 'dayPlanner',
}

export namespace ScheduleOverlapViewMode {
  /**
   * Short label for settings UI (segmented buttons).
   */
  export const getLabel = (mode?: ScheduleOverlapViewMode) => {
    switch (mode) {
      case ScheduleOverlapViewMode.list:
        return 'List';
      case ScheduleOverlapViewMode.dayPlanner:
        return 'Day Planner';
      default:
        return 'List';
    }
  };
}
