import React, {PropsWithChildren, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {LfgFilterContext} from '#src/Context/Contexts/LfgFilterContext';
import {FezType} from '#src/Enums/FezType';

export const LfgFilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [lfgCruiseDayFilter, setLfgCruiseDayFilter] = useState<number>();
  const [lfgTypeFilter, setLfgTypeFilter] = useState<FezType | undefined>();
  const [lfgHidePastFilter, setLfgHidePastFilter] = useState(appConfig.schedule.hidePastLfgs);
  const [lfgOnlyNew, setLfgOnlyNew] = useState<boolean | undefined>(undefined);
  const [lfgFavoriteFilter, setLfgFavoriteFilter] = useState<boolean | undefined>(undefined);

  return (
    <LfgFilterContext.Provider
      value={{
        lfgCruiseDayFilter,
        setLfgCruiseDayFilter,
        lfgTypeFilter,
        setLfgTypeFilter,
        lfgHidePastFilter,
        setLfgHidePastFilter,
        lfgOnlyNew,
        setLfgOnlyNew,
        lfgFavoriteFilter,
        setLfgFavoriteFilter,
      }}>
      {children}
    </LfgFilterContext.Provider>
  );
};
