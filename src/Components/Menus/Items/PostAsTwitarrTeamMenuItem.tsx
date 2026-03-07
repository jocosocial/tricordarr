import * as React from 'react';
import {Menu} from 'react-native-paper';

import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

interface PostAsTwitarrTeamMenuItemProps {
  closeMenu: () => void;
  active?: boolean;
  onPress?: () => void;
}

export const PostAsTwitarrTeamMenuItem = ({closeMenu, active, onPress}: PostAsTwitarrTeamMenuItemProps) => {
  const {hasTwitarrTeam} = usePrivilege();
  const {asTwitarrTeam, toggleTwitarrTeam} = useElevation();
  const {commonStyles} = useStyles();
  const isActive = active ?? asTwitarrTeam;
  const handlePress = onPress ?? toggleTwitarrTeam;

  if (!hasTwitarrTeam) {
    return null;
  }
  return (
    <Menu.Item
      title={'Post as TwitarrTeam'}
      dense={false}
      leadingIcon={AppIcons.twitarteam}
      onPress={() => {
        handlePress();
        closeMenu();
      }}
      style={isActive ? commonStyles.surfaceVariant : undefined}
    />
  );
};
