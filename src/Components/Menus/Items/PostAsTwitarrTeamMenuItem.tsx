import * as React from 'react';
import {Menu} from 'react-native-paper';

import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';

export const PostAsTwitarrTeamMenuItem = ({closeMenu}: {closeMenu: () => void}) => {
  const {hasTwitarrTeam} = usePrivilege();
  const {asTwitarrTeam, becomeUser, clearElevation} = useElevation();
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
        if (asTwitarrTeam) {
          clearElevation();
        } else {
          becomeUser(PrivilegedUserAccounts.TwitarrTeam);
        }
        closeMenu();
      }}
      style={asTwitarrTeam ? commonStyles.surfaceVariant : undefined}
    />
  );
};
