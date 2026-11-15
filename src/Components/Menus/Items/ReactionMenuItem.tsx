import React from 'react';
import {Menu} from 'react-native-paper';

interface ReactionMenuItemProps {
  disabled?: boolean;
  onPress: () => void;
}

/** Opens the reaction picker for a forum or chat post. */
export const ReactionMenuItem = ({disabled = false, onPress}: ReactionMenuItemProps) => {
  return (
    <Menu.Item dense={false} leadingIcon={'emoticon-outline'} title={'React'} disabled={disabled} onPress={onPress} />
  );
};
