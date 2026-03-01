import React, {PropsWithChildren} from 'react';

import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useTimeZoneChangesQuery} from '#src/Queries/Admin/TimeZoneQueries';

/**
 * Mounts the timezone changes query so data is in cache before the user opens
 * the schedule or day planner. No context value; just keeps the query active.
 */
export const TimeZoneChangesProvider = ({children}: PropsWithChildren) => {
  const {oobeCompleted} = useOobe();
  useTimeZoneChangesQuery({enabled: oobeCompleted});
  return <>{children}</>;
};
