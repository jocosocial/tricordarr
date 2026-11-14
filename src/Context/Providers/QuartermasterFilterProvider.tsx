import React, {PropsWithChildren, useCallback, useMemo, useState} from 'react';

import {QuartermasterFilterContext} from '#src/Context/Contexts/QuartermasterFilterContext';
import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';

/**
 * In-memory filter state for the Quartermastarr list. Resets on app restart.
 */
export const QuartermasterFilterProvider = ({children}: PropsWithChildren) => {
  const [quartermasterCategory, setQuartermasterCategory] = useState<QuartermasterCategory>(QuartermasterCategory.have);
  const [quartermasterMine, setQuartermasterMine] = useState(false);
  const [quartermasterSearch, setQuartermasterSearch] = useState('');

  const clearQuartermasterFilters = useCallback(() => {
    setQuartermasterMine(false);
    setQuartermasterSearch('');
  }, []);

  const value = useMemo(
    () => ({
      quartermasterCategory,
      setQuartermasterCategory,
      quartermasterMine,
      setQuartermasterMine,
      quartermasterSearch,
      setQuartermasterSearch,
      clearQuartermasterFilters,
      anyQuartermasterFilterActive: quartermasterMine || quartermasterSearch !== '',
    }),
    [quartermasterCategory, quartermasterMine, quartermasterSearch, clearQuartermasterFilters],
  );

  return <QuartermasterFilterContext.Provider value={value}>{children}</QuartermasterFilterContext.Provider>;
};
