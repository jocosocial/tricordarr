import * as React from 'react';
import {Menu} from 'react-native-paper';

import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

interface PostAsModeratorMenuItemProps {
  closeMenu: () => void;
}

/**
 * Toggles the screen's moderator elevation. Reads ElevationContext directly, so it must render
 * inside a MenuContextBridge (AppMenu provides one).
 */
export const PostAsModeratorMenuItem = ({closeMenu}: PostAsModeratorMenuItemProps) => {
  const {hasModerator} = usePrivilege();
  const {asModerator, toggleModerator} = useElevation();
  const {commonStyles} = useStyles();

  if (!hasModerator) {
    return null;
  }
  return (
    <Menu.Item
      title={'Post as Moderator'}
      dense={false}
      leadingIcon={AppIcons.moderator}
      onPress={() => {
        toggleModerator();
        closeMenu();
      }}
      style={asModerator ? commonStyles.surfaceVariant : undefined}
    />
  );
};
