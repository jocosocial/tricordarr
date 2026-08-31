import React, {PropsWithChildren, useState} from 'react';

import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {ScheduleCruiseDayContext} from '#src/Context/Contexts/ScheduleCruiseDayContext';
import {useFollowCruiseDayToday} from '#src/Hooks/useFollowCruiseDayToday';

/**
 * Session state for the selected schedule cruise day.
 *
 * Schedule Day and Day Planner both read/write this so changing the day on either
 * screen (including Back from the planner) stays in sync. See
 * https://github.com/jocosocial/tricordarr/issues/457
 */
export const ScheduleCruiseDayProvider = ({children}: PropsWithChildren) => {
  const {adjustedCruiseDayToday} = useCruise();
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(adjustedCruiseDayToday || 1);

  useFollowCruiseDayToday(selectedCruiseDay, setSelectedCruiseDay);

  return (
    <ScheduleCruiseDayContext.Provider
      value={{
        selectedCruiseDay,
        setSelectedCruiseDay,
      }}>
      {children}
    </ScheduleCruiseDayContext.Provider>
  );
};
