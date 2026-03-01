import {Moment} from 'moment-timezone';
import {createContext, useContext} from 'react';

export interface TimeContextType {
  /** Updates every hour on the hour; use for time-based UI that should refresh hourly. */
  hourlyUpdatingDate: Date;
  /** Whether the timezone warnings should be shown. */
  showTimeZoneWarning: boolean;
  /**
   * Return a moment in the boat's timezone, adjusted for lateDayFlip.
   * When lateDayFlip is enabled, subtracts 3 hours so that timestamps between
   * midnight and 3:00 AM are grouped with the previous day.
   */
  getAdjustedMoment: (timestamp: string) => Moment;
}

export const TimeContext = createContext({} as TimeContextType);

export const useTime = () => useContext(TimeContext);
