import React from 'react';
import {Menu} from 'react-native-paper';

import {StateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';

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
