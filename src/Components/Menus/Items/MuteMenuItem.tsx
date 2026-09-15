import React from 'react';
import {Menu} from 'react-native-paper';

import {getStateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';

interface FavoriteMenuItemProps {
  isMuted?: boolean;
  disabled?: boolean;
  onPress: () => void;
  refreshing?: boolean;
}

/**
 * Menu item that toggles a mute relation, with a spinner while the mutation is in flight.
 */
export const MuteMenuItem = (props: FavoriteMenuItemProps) => {
  return (
    <Menu.Item
      title={props.isMuted ? 'Unmute' : 'Mute'}
      leadingIcon={getStateLoadingIcon({
        isLoading: props.refreshing,
        state: props.isMuted,
        iconTrue: AppIcons.unmute,
        iconFalse: AppIcons.mute,
      })}
      onPress={props.onPress}
      disabled={props.disabled}
    />
  );
};
