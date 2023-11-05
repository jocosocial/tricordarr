import React, {useState, PropsWithChildren} from 'react';
import {ScheduleFilterContext} from '../Contexts/ScheduleFilterContext';

export const ScheduleFilterProvider = ({children}: PropsWithChildren) => {
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [eventFavoriteFilter, setEventFavoriteFilter] = useState(false);

  return (
    <ScheduleFilterContext.Provider
      value={{
        eventTypeFilter,
        setEventTypeFilter,
        eventFavoriteFilter,
        setEventFavoriteFilter,
      }}>
      {children}
    </ScheduleFilterContext.Provider>
  );
};
