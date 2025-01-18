import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {Item} from 'react-navigation-header-buttons';
import React from 'react';
import {useAppTheme} from '../../../styles/Theme.ts';

interface HeaderFavoriteButtonProps {
  onPress?: () => void;
  isFavorite?: boolean;
}

export const HeaderFavoriteButton = (props: HeaderFavoriteButtonProps) => {
  const theme = useAppTheme();
  return (
    <Item
      title={'Favorite'}
      color={props.isFavorite ? theme.colors.twitarrYellow : undefined}
      iconName={props.isFavorite ? AppIcons.favorite : AppIcons.toggleFavorite}
      onPress={props.onPress}
    />
  );
};
