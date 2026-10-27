import React from 'react';
import {Menu} from 'react-native-paper';

interface FezPostActionsReactionItemProps {
  disabled?: boolean;
  onPress: () => void;
}

/** Opens the free-form reaction picker for a chat post. */
export const FezPostActionsReactionItem = ({disabled = false, onPress}: FezPostActionsReactionItemProps) => {
  return (
    <Menu.Item dense={false} leadingIcon={'emoticon-outline'} title={'React'} disabled={disabled} onPress={onPress} />
  );
};
