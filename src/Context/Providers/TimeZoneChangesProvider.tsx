import React, {PropsWithChildren, useCallback} from 'react';

import {useOobe} from '#src/Context/Contexts/OobeContext';
import {TimeZoneChangesContext} from '#src/Context/Contexts/TimeZoneChangesContext';
import {useTimeZoneChangesQuery} from '#src/Queries/Admin/TimeZoneQueries';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

/**
 * Mounts the timezone changes query so data is in cache before the user opens
 * the schedule or day planner. Provides reload() to refetch time zone and server time data.
 */
export const TimeZoneChangesProvider = ({children}: PropsWithChildren) => {
  const {oobeCompleted} = useOobe();
  const {refetch: refetchTimeZoneChanges} = useTimeZoneChangesQuery({enabled: oobeCompleted});
  const {refetch: refetchNotificationData} = useUserNotificationDataQuery();

  const reload = useCallback(async () => {
    await Promise.all([refetchTimeZoneChanges(), refetchNotificationData()]);
  }, [refetchTimeZoneChanges, refetchNotificationData]);

  return <TimeZoneChangesContext.Provider value={{reload}}>{children}</TimeZoneChangesContext.Provider>;
};
