/**
 * Photographer-status filters for events, available to Shutternaut/Shutternaut Manager roles.
 * These are compared client-side (see comment in src/Libraries/Schedule.ts mirroring the Site
 * UI's JS-side filtering) and are mutually exclusive with each other, but combine with event
 * type and favorites since all three narrow the Events source.
 */
export const ShutternautFilter = {
  imPhotographer: "You're Photographing",
  noPhotographer: 'No Photographer',
  hasPhotographer: 'Has Photographer',
  needsPhotographer: 'Needs Photographer',
} as const;

export type ShutternautFilterKey = keyof typeof ShutternautFilter;
