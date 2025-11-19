import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';

interface HeaderFavoriteButtonProps {
  onPress?: () => void;
  isFavorite?: boolean;
}

export const HeaderFavoriteButton = (props: HeaderFavoriteButtonProps) => {
  const {theme} = useAppTheme();
  return (
    <Item
      title={'Favorite'}
      color={props.isFavorite ? theme.colors.twitarrYellow : undefined}
      iconName={props.isFavorite ? AppIcons.favorite : AppIcons.toggleFavorite}
      onPress={props.onPress}
    />
  );
};
