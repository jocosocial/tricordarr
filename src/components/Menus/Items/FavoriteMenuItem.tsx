import {AppIcons} from '../../../libraries/Enums/Icons';
import {ActivityIndicator, Menu} from 'react-native-paper';
import React from 'react';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {StateLoadingIcon} from '../../Icons/StateLoadingIcon';

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
