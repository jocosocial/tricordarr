import {AppIcons} from '#src/Enums/Icons';
import {Menu} from 'react-native-paper';
import React from 'react';
import {StateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';

interface FavoriteMenuItemProps {
  isFavorite?: boolean;
  disabled?: boolean;
  onPress: () => void;
  refreshing?: boolean;
}

export const FavoriteMenuItem = (props: FavoriteMenuItemProps) => {
  const getLeadingIcon = () => (
    <StateLoadingIcon
      isLoading={props.refreshing}
      state={props.isFavorite}
      iconTrue={AppIcons.unfavorite}
      iconFalse={AppIcons.favorite}
    />
  );

  return (
    <Menu.Item
      title={props.isFavorite ? 'Unfavorite' : 'Favorite'}
      leadingIcon={getLeadingIcon}
      onPress={props.onPress}
      disabled={props.disabled}
    />
  );
};
