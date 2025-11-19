import {HeaderHeightContext} from '@react-navigation/elements';
import {useContext, useEffect} from 'react';

import {useLayout} from '#src/Context/Contexts/LayoutContext';

/**
 * Component that measures the header height from a stack navigator
 * and updates the LayoutContext.
 *
 * This should be placed in any stack navigator that shows a header.
 * Gracefully handles cases where no header context is available.
 */
export const HeaderHeightMeasurer = () => {
  const headerHeight = useContext(HeaderHeightContext);
  const {headerHeight: headerHeightShared} = useLayout();

  useEffect(() => {
    // Update with header height, or 0 if undefined (no header present)
    headerHeightShared.set(headerHeight ?? 0);
  }, [headerHeight, headerHeightShared]);

  return null;
};
