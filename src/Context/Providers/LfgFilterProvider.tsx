import React, {PropsWithChildren, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {LfgFilterContext} from '#src/Context/Contexts/LfgFilterContext';
import {FezType} from '#src/Enums/FezType';

export const LfgFilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [lfgCruiseDayFilter, setLfgCruiseDayFilter] = useState<number>();
  const [lfgTypeFilter, setLfgTypeFilter] = useState<keyof typeof FezType>();
  const [lfgHidePastFilter, setLfgHidePastFilter] = useState(appConfig.schedule.hidePastLfgs);
  const [lfgOnlyNew, setLfgOnlyNew] = useState<boolean | undefined>(undefined);

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
      }}>
      {children}
    </LfgFilterContext.Provider>
  );
};
