import React from 'react';
import {Menu} from 'react-native-paper';

import {getStateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';

interface FavoriteMenuItemProps {
  isFavorite?: boolean;
  disabled?: boolean;
  onPress: () => void;
  refreshing?: boolean;
}

/**
 * Menu item that toggles a favorite relation, with a spinner while the mutation is in flight.
 */
export const FavoriteMenuItem = (props: FavoriteMenuItemProps) => {
  return (
    <Menu.Item
      title={props.isFavorite ? 'Unfavorite' : 'Favorite'}
      leadingIcon={getStateLoadingIcon({
        isLoading: props.refreshing,
        state: props.isFavorite,
        iconTrue: AppIcons.unfavorite,
        iconFalse: AppIcons.favorite,
      })}
      onPress={props.onPress}
      disabled={props.disabled}
    />
  );
};
