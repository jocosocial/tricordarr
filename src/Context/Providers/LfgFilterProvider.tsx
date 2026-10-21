import React, {PropsWithChildren, useCallback, useMemo, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {LfgFilterContext} from '#src/Context/Contexts/LfgFilterContext';
import {FezType} from '#src/Enums/FezType';
import {LfgListSource} from '#src/Types';

export const LfgFilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [lfgCruiseDayFilter, setLfgCruiseDayFilter] = useState<number>();
  const [lfgSourceFilter, setLfgSourceFilterState] = useState<LfgListSource>('open');
  const [lfgTypeFilter, setLfgTypeFilter] = useState<FezType | undefined>();
  const [lfgHidePastFilter, setLfgHidePastFilter] = useState(appConfig.schedule.hidePastLfgs);
  const [lfgOnlyNew, setLfgOnlyNew] = useState<boolean | undefined>(undefined);
  const [lfgFavoriteFilter, setLfgFavoriteFilter] = useState<boolean | undefined>(undefined);

  /**
   * Switches the selected LFG source. 'open' (Find) has no FezParticipant pivot, so Favorites and
   * Unread are meaningless there; clear them so a disabled row never carries a stale checkmark.
   */
  const setLfgSourceFilter = useCallback((source: LfgListSource) => {
    setLfgSourceFilterState(source);
    if (source === 'open') {
      setLfgFavoriteFilter(undefined);
      setLfgOnlyNew(undefined);
    }
  }, []);

  const clearLfgFilters = useCallback(() => {
    setLfgSourceFilterState('open');
    setLfgTypeFilter(undefined);
    setLfgHidePastFilter(appConfig.schedule.hidePastLfgs);
    setLfgOnlyNew(undefined);
    setLfgFavoriteFilter(undefined);
  }, [appConfig.schedule.hidePastLfgs]);

  const anyLfgFilterActive = useMemo(
    () =>
      lfgSourceFilter !== 'open' ||
      !!lfgTypeFilter ||
      lfgHidePastFilter ||
      lfgOnlyNew === true ||
      lfgFavoriteFilter === true,
    [lfgSourceFilter, lfgTypeFilter, lfgHidePastFilter, lfgOnlyNew, lfgFavoriteFilter],
  );

  return (
    <LfgFilterContext.Provider
      value={{
        lfgCruiseDayFilter,
        setLfgCruiseDayFilter,
        lfgSourceFilter,
        setLfgSourceFilter,
        lfgTypeFilter,
        setLfgTypeFilter,
        lfgHidePastFilter,
        setLfgHidePastFilter,
        lfgOnlyNew,
        setLfgOnlyNew,
        lfgFavoriteFilter,
        setLfgFavoriteFilter,
        clearLfgFilters,
        anyLfgFilterActive,
      }}>
      {children}
    </LfgFilterContext.Provider>
  );
};
