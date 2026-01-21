import React, {forwardRef} from 'react';
import {RefreshControl, RefreshControlProps} from 'react-native';

import {isIOS} from '#src/Libraries/Platform/Detection';

interface AppRefreshControlProps extends RefreshControlProps {
  /**
   * Whether pull-to-refresh is enabled. Defaults to true.
   * When false, the component returns null and pull-to-refresh is disabled.
   * https://reactnative.dev/docs/refreshcontrol#enabled-android
   */
  enabled?: boolean;
}

/**
 * Wrapper around RefreshControl that properly handles the enabled prop.
 * When enabled is false, returns null to completely disable pull-to-refresh.
 */
export const AppRefreshControl = forwardRef<RefreshControl, AppRefreshControlProps>(
  ({enabled = true, ...props}, ref) => {
    /**
     * iOS does not support the enabled prop. Android freaks out if the RefreshControl is null
     * (FlashList and LegendList stopped rendering entirely).
     */
    if (isIOS && !enabled) {
      return null;
    }

    return <RefreshControl ref={ref} {...props} />;
  },
);
