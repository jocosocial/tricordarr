import * as React from 'react';
import {Menu} from 'react-native-paper';

import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

interface PostAsTwitarrTeamMenuItemProps {
  closeMenu: () => void;
}

/**
 * Toggles the screen's TwitarrTeam elevation. Reads ElevationContext directly, so it must render
 * inside a MenuContextBridge (AppMenu provides one).
 */
export const PostAsTwitarrTeamMenuItem = ({closeMenu}: PostAsTwitarrTeamMenuItemProps) => {
  const {hasTwitarrTeam} = usePrivilege();
  const {asTwitarrTeam, toggleTwitarrTeam} = useElevation();
  const {commonStyles} = useStyles();

  if (!hasTwitarrTeam) {
    return null;
  }
  return (
    <Menu.Item
      title={'Post as TwitarrTeam'}
      dense={false}
      leadingIcon={AppIcons.twitarrteam}
      onPress={() => {
        toggleTwitarrTeam();
        closeMenu();
      }}
      style={asTwitarrTeam ? commonStyles.surfaceVariant : undefined}
    />
  );
};
