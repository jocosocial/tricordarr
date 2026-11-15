import * as React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {ModerateResource, pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface ModerateMenuItemProps {
  closeMenu: () => void;
  resource: ModerateResource;
  resourceID: string;
}

/**
 * Overflow-menu item that opens the native moderation screen for a piece of content.
 */
export const ModerateMenuItem = (props: ModerateMenuItemProps) => {
  const navigation = useCommonStack();
  return (
    <Menu.Item
      dense={false}
      leadingIcon={AppIcons.moderator}
      title={'Moderate'}
      onPress={() => {
        pushModerateResource(navigation, props.resource, props.resourceID);
        props.closeMenu();
      }}
    />
  );
};
