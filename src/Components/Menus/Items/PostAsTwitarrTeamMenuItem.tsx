import * as React from 'react';
import {Menu} from 'react-native-paper';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

export const PostAsTwitarrTeamMenuItem = ({closeMenu}: {closeMenu: () => void}) => {
  const {asTwitarrTeam, setAsTwitarrTeam, setAsModerator, hasTwitarrTeam} = usePrivilege();
  const {commonStyles} = useStyles();
  if (!hasTwitarrTeam) {
    return null;
  }
  return (
    <Menu.Item
      title={'Post as TwitarrTeam'}
      dense={false}
      leadingIcon={AppIcons.twitarteam}
      onPress={() => {
        setAsModerator(false);
        setAsTwitarrTeam(!asTwitarrTeam);
        closeMenu();
      }}
      style={asTwitarrTeam ? commonStyles.surfaceVariant : undefined}
    />
  );
};
