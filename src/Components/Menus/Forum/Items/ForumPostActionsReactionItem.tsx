import React from 'react';
import {Menu} from 'react-native-paper';

interface ForumPostActionsReactionItemProps {
  disabled?: boolean;
  onPress: () => void;
}

/** Opens the free-form reaction picker for a forum post. */
export const ForumPostActionsReactionItem = ({disabled = false, onPress}: ForumPostActionsReactionItemProps) => {
  return (
    <Menu.Item dense={false} leadingIcon={'emoticon-outline'} title={'React'} disabled={disabled} onPress={onPress} />
  );
};
