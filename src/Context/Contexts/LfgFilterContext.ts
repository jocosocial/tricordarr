import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {FezType} from '#src/Enums/FezType';
import {LfgListSource} from '#src/Types';

interface LfgFilterContextType {
  lfgCruiseDayFilter?: number;
  setLfgCruiseDayFilter: Dispatch<SetStateAction<number | undefined>>;
  /** Which of the Find/Joined/Owned lists is selected. Defaults to 'open' (Find). */
  lfgSourceFilter: LfgListSource;
  /** Switches the selected source, clearing Favorites/Unread if the new source can't honor them. */
  setLfgSourceFilter: (source: LfgListSource) => void;
  lfgTypeFilter?: FezType;
  setLfgTypeFilter: Dispatch<SetStateAction<FezType | undefined>>;
  lfgHidePastFilter: boolean;
  setLfgHidePastFilter: Dispatch<SetStateAction<boolean>>;
  lfgOnlyNew: boolean | undefined;
  setLfgOnlyNew: Dispatch<SetStateAction<boolean | undefined>>;
  lfgFavoriteFilter: boolean | undefined;
  setLfgFavoriteFilter: Dispatch<SetStateAction<boolean | undefined>>;
  /** Resets source to Find and clears every refinement, including Hide Past back to its config default. */
  clearLfgFilters: () => void;
  anyLfgFilterActive: boolean;
}

export const LfgFilterContext = createContext(<LfgFilterContextType>{});

export const useLfgFilter = () => useContext(LfgFilterContext);
