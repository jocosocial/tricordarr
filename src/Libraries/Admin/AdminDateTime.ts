/**
 * Combine a calendar date with hours/minutes into an ISO8601 string for Swiftarr Date fields.
 */
export const combineDateAndTime = (date: Date, time: {hours: number; minutes: number}): string => {
  const combined = new Date(date);
  combined.setHours(time.hours, time.minutes, 0, 0);
  return combined.toISOString();
};

/**
 * Split an ISO8601 timestamp into a Date (calendar day) and hours/minutes for form fields.
 */
export const splitIsoDateTime = (iso: string): {date: Date; time: {hours: number; minutes: number}} => {
  const parsed = new Date(iso);
  return {
    date: parsed,
    time: {hours: parsed.getHours(), minutes: parsed.getMinutes()},
  };
};
