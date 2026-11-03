import React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';

interface ManagePerformersMenuItemProps {
  onPress: () => void;
}

/**
 * TwitarrTeam: open the screen to link/unlink performers for this event. Callers gate
 * visibility on hasTwitarrTeam.
 *
 * Navigation comes in via onPress rather than a navigation hook here: menu items portal up to
 * the Portal.Host, which doesn't have the navigators available (same as SetOrganizerMenuItem).
 * Navigation item, so no closeMenu; menus close on navigation.
 */
export const ManagePerformersMenuItem = ({onPress}: ManagePerformersMenuItemProps) => {
  return <Menu.Item title={'Manage Performers'} leadingIcon={AppIcons.twitarrteam} onPress={onPress} />;
};
