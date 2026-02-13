import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useTimeZoneChangesQuery} from '#src/Queries/Admin/TimeZoneQueries';

/**
 * Hook for determining the ship's timezone at any given time.
 * Uses the server's authoritative timezone change schedule to determine
 * what timezone the ship was in at a specific time.
 *
 * @example
 * ```tsx
 * const {tzAtTime} = useTimeZone();
 * const timezone = tzAtTime(new Date('2025-03-05')); // Returns 'America/Puerto_Rico'
 * ```
 */
export const useTimeZone = () => {
  const {data} = useTimeZoneChangesQuery();
  const {appConfig} = useConfig();

  /**
   * Returns the TimeZone ID the ship will be in at the given Date, or the current time if no Date specified.
   * If you're using this with a 'floating' date (e.g. "2:00 PM in whatever timezone the boat is in that day")
   * be sure to call `portTimeToDisplayTime()` first, and call this function with the returned Date.
   *
   * @param time The time to check. Defaults to current time if not provided.
   * @returns The IANA timezone identifier (e.g., 'America/Puerto_Rico')
   */
  const tzAtTime = (time?: Date): string => {
    const actualTime = time ?? new Date();

    if (data?.records) {
      // Find the last timezone change where activeDate <= actualTime
      const matchingChange = data.records
        .filter(record => new Date(record.activeDate) <= actualTime)
        .sort((a, b) => new Date(b.activeDate).getTime() - new Date(a.activeDate).getTime())[0];

      if (matchingChange) {
        return matchingChange.timeZoneID;
      }
    }

    // Fall back to port timezone
    return appConfig.portTimeZoneID;
  };

  return {tzAtTime};
};
