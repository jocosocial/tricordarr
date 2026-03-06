import * as React from 'react';
import {Menu} from 'react-native-paper';

import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

interface PostAsModeratorMenuItemProps {
  closeMenu: () => void;
  active?: boolean;
  onPress?: () => void;
}

export const PostAsModeratorMenuItem = ({closeMenu, active, onPress}: PostAsModeratorMenuItemProps) => {
  const {hasModerator} = usePrivilege();
  const {asModerator, toggleModerator} = useElevation();
  const {commonStyles} = useStyles();
  const isActive = active ?? asModerator;
  const handlePress = onPress ?? toggleModerator;

  if (!hasModerator) {
    return null;
  }
  return (
    <Menu.Item
      title={'Post as Moderator'}
      dense={false}
      leadingIcon={AppIcons.moderator}
      onPress={() => {
        handlePress();
        closeMenu();
      }}
      style={isActive ? commonStyles.surfaceVariant : undefined}
    />
  );
};
