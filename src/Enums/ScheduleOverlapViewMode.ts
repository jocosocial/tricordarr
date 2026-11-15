/**
 * How the Overlapping Events screen lays out its items.
 */
export enum ScheduleOverlapViewMode {
  list = 'list',
  timeline = 'timeline',
}

export namespace ScheduleOverlapViewMode {
  /**
   * Short label for settings UI (segmented buttons).
   */
  export const getLabel = (mode?: ScheduleOverlapViewMode) => {
    switch (mode) {
      case ScheduleOverlapViewMode.list:
        return 'List';
      case ScheduleOverlapViewMode.timeline:
        return 'Planner';
      default:
        return 'List';
    }
  };
}
