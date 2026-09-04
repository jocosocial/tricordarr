import {StackNavigationProp} from '@react-navigation/stack';
import * as React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {ModerateResource, pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface ModerateMenuItemProps {
  closeMenu: () => void;
  resource: ModerateResource;
  resourceID: string;
  navigation: StackNavigationProp<CommonStackParamList>;
}

/**
 * Overflow-menu item that opens the native moderation screen for a piece of content.
 */
export const ModerateMenuItem = (props: ModerateMenuItemProps) => {
  return (
    <Menu.Item
      dense={false}
      leadingIcon={AppIcons.moderator}
      title={'Moderate'}
      onPress={() => {
        pushModerateResource(props.navigation, props.resource, props.resourceID);
        props.closeMenu();
      }}
    />
  );
};
