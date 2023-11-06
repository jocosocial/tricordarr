import React, {useState, PropsWithChildren} from 'react';
import {ScheduleFilterContext} from '../Contexts/ScheduleFilterContext';
import {FezType} from '../../../libraries/Enums/FezType';
import {useConfig} from '../Contexts/ConfigContext';

export const ScheduleFilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [eventFavoriteFilter, setEventFavoriteFilter] = useState(false);
  const [lfgCruiseDayFilter, setLfgCruiseDayFilter] = useState<number>();
  const [lfgTypeFilter, setLfgTypeFilter] = useState<keyof typeof FezType>();
  const [lfgHidePastFilter, setLfgHidePastFilter] = useState(appConfig.hidePastLfgs);

  return (
    <ScheduleFilterContext.Provider
      value={{
        eventTypeFilter,
        setEventTypeFilter,
        eventFavoriteFilter,
        setEventFavoriteFilter,
        lfgCruiseDayFilter,
        setLfgCruiseDayFilter,
        lfgTypeFilter,
        setLfgTypeFilter,
        lfgHidePastFilter,
        setLfgHidePastFilter,
      }}>
      {children}
    </ScheduleFilterContext.Provider>
  );
};
