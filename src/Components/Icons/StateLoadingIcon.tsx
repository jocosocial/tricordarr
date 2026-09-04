import React from 'react';
import {ActivityIndicator} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

interface StateLoadingIconProps {
  isLoading?: boolean;
  state?: boolean;
  iconTrue: string;
  iconFalse: string;
}

/**
 * Paper Menu.Item IconSource that shows a spinner while loading, otherwise
 * the icon for the current boolean state. Returning a string lets Paper
 * apply the menu item's icon color instead of AppIcon's default.
 */
export const getStateLoadingIcon = ({isLoading, state, iconTrue, iconFalse}: StateLoadingIconProps): IconSource => {
  if (isLoading) {
    return () => <ActivityIndicator />;
  }
  return state ? iconTrue : iconFalse;
};
