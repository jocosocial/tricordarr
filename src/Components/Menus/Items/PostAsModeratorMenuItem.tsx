import * as React from 'react';
import {Menu} from 'react-native-paper';

import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';

export const PostAsModeratorMenuItem = ({closeMenu}: {closeMenu: () => void}) => {
  const {hasModerator} = usePrivilege();
  const {asModerator, becomeUser, clearElevation} = useElevation();
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
        if (asModerator) {
          clearElevation();
        } else {
          becomeUser(PrivilegedUserAccounts.moderator);
        }
        closeMenu();
      }}
      style={asModerator ? commonStyles.surfaceVariant : undefined}
    />
  );
};
