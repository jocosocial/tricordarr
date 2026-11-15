import React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';

interface ReactionMenuItemProps {
  disabled?: boolean;
  onPress: () => void;
}

/** Opens the reaction picker for a forum or chat post. */
export const ReactionMenuItem = ({disabled = false, onPress}: ReactionMenuItemProps) => {
  return (
    <Menu.Item
      testID={'postActionsReact-button'}
      dense={false}
      leadingIcon={AppIcons.react}
      title={'React'}
      disabled={disabled}
      onPress={onPress}
    />
  );
};
