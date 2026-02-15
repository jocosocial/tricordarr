import {createContext, useContext} from 'react';

export interface TimeContextType {
  /** Updates every hour on the hour; use for time-based UI that should refresh hourly. */
  hourlyUpdatingDate: Date;
  /** Whether the timezone warnings should be shown. */
  showTimeZoneWarning: boolean;
}

export const TimeContext = createContext({} as TimeContextType);

export const useTime = () => useContext(TimeContext);
