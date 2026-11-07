import {createContext, useContext} from 'react';

import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';

interface QuartermasterFilterContextType {
  /** Which of the Have/Need lists is selected. Defaults to Have. */
  quartermasterCategory: QuartermasterCategory;
  setQuartermasterCategory: (category: QuartermasterCategory) => void;
  /** Limits the list to the current user's own items. */
  quartermasterMine: boolean;
  setQuartermasterMine: (mine: boolean) => void;
  /** The submitted search term. Empty when no search is applied. */
  quartermasterSearch: string;
  setQuartermasterSearch: (search: string) => void;
  /** Clears Mine and search. The selected category is a tab, not a refinement, so it is kept. */
  clearQuartermasterFilters: () => void;
  anyQuartermasterFilterActive: boolean;
}

/**
 * In-memory Quartermastarr list filters (category, Mine, search). Provided by
 * `QuartermasterFilterProvider`.
 */
export const QuartermasterFilterContext = createContext(<QuartermasterFilterContextType>{});

/**
 * The Quartermastarr list filters and their setters.
 */
export const useQuartermasterFilter = () => useContext(QuartermasterFilterContext);
