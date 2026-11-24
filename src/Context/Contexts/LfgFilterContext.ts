import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {FezType} from '#src/Enums/FezType';
import {LfgListSource} from '#src/Types';

interface LfgFilterContextType {
  lfgCruiseDayFilter?: number;
  setLfgCruiseDayFilter: Dispatch<SetStateAction<number | undefined>>;
  /** Which list is selected: all LFGs, only Joined, or only Owned. Defaults to 'all', or 'owner' in pre-registration. */
  lfgSourceFilter: LfgListSource;
  /** Switches the selected source. */
  setLfgSourceFilter: (source: LfgListSource) => void;
  lfgTypeFilter?: FezType;
  setLfgTypeFilter: Dispatch<SetStateAction<FezType | undefined>>;
  lfgHidePastFilter: boolean;
  setLfgHidePastFilter: Dispatch<SetStateAction<boolean>>;
  /** When true, only cancelled LFGs are shown. Off by default, which leaves cancelled LFGs in the list. */
  lfgCancelledFilter: boolean;
  setLfgCancelledFilter: Dispatch<SetStateAction<boolean>>;
  lfgOnlyNew: boolean | undefined;
  setLfgOnlyNew: Dispatch<SetStateAction<boolean | undefined>>;
  lfgFavoriteFilter: boolean | undefined;
  setLfgFavoriteFilter: Dispatch<SetStateAction<boolean | undefined>>;
  /** Resets source to the default (all) and clears every refinement, including Hide Past back to its config default. */
  clearLfgFilters: () => void;
  anyLfgFilterActive: boolean;
}

export const LfgFilterContext = createContext(<LfgFilterContextType>{});

export const useLfgFilter = () => useContext(LfgFilterContext);
