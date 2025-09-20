import React from 'react';
import {ActivityIndicator} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';

interface BooleanLoadingIconProps {
  isLoading?: boolean;
  state?: boolean;
  iconTrue: string;
  iconFalse: string;
}

export const StateLoadingIcon = ({isLoading, state, iconFalse, iconTrue}: BooleanLoadingIconProps) => {
  if (isLoading) {
    return <ActivityIndicator />;
  }
  return <AppIcon icon={state ? iconTrue : iconFalse} />;
};
