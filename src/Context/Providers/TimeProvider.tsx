import React, {PropsWithChildren} from 'react';

import {TimeContext} from '#src/Context/Contexts/TimeContext';
import {useTimeZoneWarning} from '#src/Hooks/useTimeZoneWarning';
import useDateTime from '#src/Libraries/DateTime';

export const TimeProvider = ({children}: PropsWithChildren) => {
  const {showTimeZoneWarning} = useTimeZoneWarning();
  const hourlyUpdatingDate = useDateTime('hour');

  return <TimeContext.Provider value={{hourlyUpdatingDate, showTimeZoneWarning}}>{children}</TimeContext.Provider>;
};
