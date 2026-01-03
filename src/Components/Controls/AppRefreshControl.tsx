import React, {forwardRef} from 'react';
import {RefreshControl, RefreshControlProps} from 'react-native';

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
    if (!enabled) {
      return null;
    }

    return <RefreshControl ref={ref} {...props} />;
  },
);
