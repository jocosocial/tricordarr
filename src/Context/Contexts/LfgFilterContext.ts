import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {FezType} from '#src/Enums/FezType';

interface LfgFilterContextType {
  lfgCruiseDayFilter?: number;
  setLfgCruiseDayFilter: Dispatch<SetStateAction<number | undefined>>;
  lfgTypeFilter?: FezType;
  setLfgTypeFilter: Dispatch<SetStateAction<FezType | undefined>>;
  lfgHidePastFilter: boolean;
  setLfgHidePastFilter: Dispatch<SetStateAction<boolean>>;
  lfgOnlyNew: boolean | undefined;
  setLfgOnlyNew: Dispatch<SetStateAction<boolean | undefined>>;
}

export const LfgFilterContext = createContext(<LfgFilterContextType>{});

export const useLfgFilter = () => useContext(LfgFilterContext);
