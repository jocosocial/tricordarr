import {AppIcons} from '#src/Libraries/Enums/Icons';
import {ActivityIndicator, Menu} from 'react-native-paper';
import React from 'react';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

interface FavoriteMenuItemProps {
  isMuted?: boolean;
  disabled?: boolean;
  onPress: () => void;
  refreshing?: boolean;
}

const getIndicator = () => <ActivityIndicator />;

export const MuteMenuItem = (props: FavoriteMenuItemProps) => {
  const getLeadingIcon = (): IconSource => {
    if (props.refreshing) {
      return getIndicator;
    }
    return props.isMuted ? AppIcons.unmute : AppIcons.mute;
  };

  return (
    <Menu.Item
      title={props.isMuted ? 'Unmute' : 'Mute'}
      leadingIcon={getLeadingIcon()}
      onPress={props.onPress}
      disabled={props.disabled}
    />
  );
};
