import React, {PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {LfgFilterContext} from '#src/Context/Contexts/LfgFilterContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {FezType} from '#src/Enums/FezType';
import {LfgListSource} from '#src/Types';

export const LfgFilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  // In pre-registration mode users can only list the LFGs they own, so Owned is both the default
  // and the only source.
  const {preRegistrationMode} = usePreRegistration();
  const defaultSource: LfgListSource = preRegistrationMode ? 'owner' : 'all';
  const [lfgCruiseDayFilter, setLfgCruiseDayFilter] = useState<number>();
  const [lfgSourceFilter, setLfgSourceFilterState] = useState<LfgListSource>(defaultSource);
  const [lfgTypeFilter, setLfgTypeFilter] = useState<FezType | undefined>();
  const [lfgHidePastFilter, setLfgHidePastFilter] = useState(appConfig.schedule.hidePastLfgs);
  const [lfgCancelledFilter, setLfgCancelledFilter] = useState(false);
  const [lfgOnlyNew, setLfgOnlyNew] = useState<boolean | undefined>(undefined);
  const [lfgFavoriteFilter, setLfgFavoriteFilter] = useState<boolean | undefined>(undefined);

  /**
   * Switches the selected LFG source. In pre-registration mode the source is held on Owned whatever
   * is requested (e.g. the LFG list's initial `endpoint: 'all'` route param).
   */
  const setLfgSourceFilter = useCallback(
    (source: LfgListSource) => {
      setLfgSourceFilterState(preRegistrationMode ? 'owner' : source);
    },
    [preRegistrationMode],
  );

  /**
   * Move onto the default source when pre-registration mode changes: Owned on the way in, All on
   * the way out. On mount this matches the initial state, and it doesn't re-run for a selection
   * made while the mode stays the same.
   */
  useEffect(() => {
    setLfgSourceFilterState(defaultSource);
  }, [defaultSource]);

  const clearLfgFilters = useCallback(() => {
    setLfgSourceFilterState(defaultSource);
    setLfgTypeFilter(undefined);
    setLfgHidePastFilter(appConfig.schedule.hidePastLfgs);
    setLfgCancelledFilter(false);
    setLfgOnlyNew(undefined);
    setLfgFavoriteFilter(undefined);
  }, [appConfig.schedule.hidePastLfgs, defaultSource]);

  // Hide Past defaults to the user's "Hide Past LFGs" setting, so it only counts as active when it
  // differs from that. Otherwise clearing would reset it to an "active" value and the filter
  // indicator would stay lit.
  const anyLfgFilterActive = useMemo(
    () =>
      lfgSourceFilter !== defaultSource ||
      !!lfgTypeFilter ||
      lfgHidePastFilter !== appConfig.schedule.hidePastLfgs ||
      lfgCancelledFilter ||
      lfgOnlyNew === true ||
      lfgFavoriteFilter === true,
    [
      lfgSourceFilter,
      defaultSource,
      lfgTypeFilter,
      lfgHidePastFilter,
      appConfig.schedule.hidePastLfgs,
      lfgCancelledFilter,
      lfgOnlyNew,
      lfgFavoriteFilter,
    ],
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
        lfgCancelledFilter,
        setLfgCancelledFilter,
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
