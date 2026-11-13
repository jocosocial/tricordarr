/**
 * Sources that can contribute items to the schedule list. These are additive (OR) — selecting
 * more than one widens the list. Contrast with the refinement filters (event type, favorite,
 * shutternaut, unread) which narrow a single source. See docs/Cache and State.md and #458.
 */
export const ScheduleSource = {
  officialEvents: 'Events',
  privateEvents: 'Private Events',
  lfgJoined: 'Joined LFGs',
  lfgOwned: 'Your LFGs',
  lfgOpen: 'Open LFGs',
} as const;

export type ScheduleSourceKey = keyof typeof ScheduleSource;
