import moment from 'moment-timezone';
import React, {PropsWithChildren, useCallback} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {TimeContext} from '#src/Context/Contexts/TimeContext';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {useTimeZoneWarning} from '#src/Hooks/useTimeZoneWarning';
import useDateTime from '#src/Libraries/DateTime';

export const TimeProvider = ({children}: PropsWithChildren) => {
  const {showTimeZoneWarning} = useTimeZoneWarning();
  const hourlyUpdatingDate = useDateTime('hour');
  const {appConfig} = useConfig();
  const {tzAtTime} = useTimeZone();

  const getAdjustedMoment = useCallback(
    (timestamp: string) => {
      const date = new Date(timestamp);
      const tz = tzAtTime(date);
      let m = moment(timestamp).tz(tz);
      if (appConfig.schedule.enableLateDayFlip) {
        m = m.subtract(3, 'hours');
      }
      return m;
    },
    [appConfig.schedule.enableLateDayFlip, tzAtTime],
  );

  return (
    <TimeContext.Provider value={{hourlyUpdatingDate, showTimeZoneWarning, getAdjustedMoment}}>
      {children}
    </TimeContext.Provider>
  );
};
