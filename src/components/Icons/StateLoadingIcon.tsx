import React from 'react';
import {AppIcon} from './AppIcon';
import {ActivityIndicator} from 'react-native-paper';

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
