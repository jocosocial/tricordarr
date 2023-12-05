import {AppIcons} from '../../libraries/Enums/Icons';
import React from 'react';
import {AppIcon} from './AppIcon';
import {ActivityIndicator} from 'react-native-paper';

export const FavoriteIcon = ({isFavorite, isLoading}: {isFavorite?: boolean; isLoading?: boolean}) => {
  if (isLoading) {
    return <ActivityIndicator />;
  }
  return <AppIcon icon={isFavorite ? AppIcons.unfavorite : AppIcons.favorite} />;
};
