import {AppIcons} from '#src/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import React from 'react';
import {useAppTheme} from '#src/Styles/Theme';

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
