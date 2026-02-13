import moment from 'moment-timezone';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useTimeZoneChangesQuery} from '#src/Queries/Admin/TimeZoneQueries';

/**
 * Hook for determining the ship's timezone at any given time.
 * Uses the server's authoritative timezone change schedule to determine
 * what timezone the ship was in at a specific time.
 *
 * Much of this came from Swiftarr.
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Models/TimeZoneChange.swift
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

  /**
   * Returns the 3-letter abbreviation for the timezone the ship will be in at the given Date,
   * or the current time if no Date specified. If you're using this with a 'floating' date
   * (e.g. "2:00 PM in whatever timezone the boat is in that day") be sure to call
   * `portTimeToDisplayTime()` first, and call this function with the returned Date.
   * Do not use these abbreviations to later create timezone objects; use `tzAtTime()` instead.
   *
   * @param time The time to check. Defaults to current time if not provided.
   * @returns The timezone abbreviation (e.g., 'EST', 'AST')
   */
  const abbrevAtTime = (time?: Date): string => {
    const actualTime = time ?? new Date();

    if (data?.records) {
      const matchingChange = data.records
        .filter(record => new Date(record.activeDate) <= actualTime)
        .sort((a, b) => new Date(b.activeDate).getTime() - new Date(a.activeDate).getTime())[0];

      if (matchingChange) {
        const abbr = moment(actualTime).tz(matchingChange.timeZoneID).format('z');
        return abbr || matchingChange.timeZoneAbbrev;
      }
    }

    const portAbbr = moment(actualTime).tz(appConfig.portTimeZoneID).format('z');
    return portAbbr || 'EST';
  };

  /**
   * Converts a 'floating' date (stored in port time, e.g. "March 10, 2:00 PM") to the equivalent
   * display time in the boat's current timezone. Floating dates in the DB are in port time so that
   * "all events on Tuesday" filters stay correct; when the API delivers dates to clients we convert
   * into the timezone the boat is in. If the boat isn't where expected or the captain declares an
   * unexpected TZ change, floating dates stay correct once the TimeZoneChange table is updated.
   * Call this to convert timezones; do not compute offsets and add/subtract from Date objects.
   *
   * @param time The port-time date to convert. Defaults to current time if not provided.
   * @returns The same wall-clock time interpreted in the boat's timezone at that time.
   */
  const portTimeToDisplayTime = (time?: Date): Date => {
    const actualTime = time ?? new Date();

    if (data?.records) {
      const matchingChange = data.records
        .filter(record => new Date(record.activeDate) <= actualTime)
        .sort((a, b) => new Date(b.activeDate).getTime() - new Date(a.activeDate).getTime())[0];

      if (matchingChange) {
        const portMoment = moment(actualTime).tz(appConfig.portTimeZoneID);
        const boatTz = matchingChange.timeZoneID;
        const displayMoment = moment.tz(
          {
            year: portMoment.year(),
            month: portMoment.month(),
            date: portMoment.date(),
            hour: portMoment.hours(),
            minute: portMoment.minutes(),
            second: portMoment.seconds(),
          },
          boatTz,
        );
        return displayMoment.toDate();
      }
    }

    return actualTime;
  };

  return {tzAtTime, abbrevAtTime, portTimeToDisplayTime};
};
