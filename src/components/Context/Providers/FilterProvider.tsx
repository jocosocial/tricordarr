import React, {PropsWithChildren, useState} from 'react';
import {FilterContext} from '../Contexts/FilterContext';
import {FezType} from '../../../libraries/Enums/FezType';
import {useConfig} from '../Contexts/ConfigContext';
import {ForumFilter, ForumSortOrder} from '../../../libraries/Enums/ForumSortFilter';

export const FilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [eventFavoriteFilter, setEventFavoriteFilter] = useState(false);
  const [lfgCruiseDayFilter, setLfgCruiseDayFilter] = useState<number>();
  const [lfgTypeFilter, setLfgTypeFilter] = useState<keyof typeof FezType>();
  const [lfgHidePastFilter, setLfgHidePastFilter] = useState(appConfig.schedule.hidePastLfgs);
  const [forumFilter, setForumFilter] = useState<ForumFilter>();
  const [forumSortOrder, setForumSortOrder] = useState<ForumSortOrder>();

  return (
    <FilterContext.Provider
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
        forumFilter,
        setForumFilter,
        forumSortOrder,
        setForumSortOrder,
      }}>
      {children}
    </FilterContext.Provider>
  );
};
