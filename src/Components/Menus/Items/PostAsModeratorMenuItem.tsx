import * as React from 'react';
import {Menu} from 'react-native-paper';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

export const PostAsModeratorMenuItem = ({closeMenu}: {closeMenu: () => void}) => {
  const {asModerator, setAsTwitarrTeam, setAsModerator, hasModerator} = usePrivilege();
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
        setAsTwitarrTeam(false);
        setAsModerator(!asModerator);
        closeMenu();
      }}
      style={asModerator ? commonStyles.surfaceVariant : undefined}
    />
  );
};
