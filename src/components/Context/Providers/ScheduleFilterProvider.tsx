import React, {useState, PropsWithChildren} from 'react';
import {ScheduleFilterContext} from '../Contexts/ScheduleFilterContext';

export const ScheduleFilterProvider = ({children}: PropsWithChildren) => {
  const [eventTypeFilter, setEventTypeFilter] = useState('');

  return (
    <ScheduleFilterContext.Provider
      value={{
        eventTypeFilter,
        setEventTypeFilter,
      }}>
      {children}
    </ScheduleFilterContext.Provider>
  );
};
