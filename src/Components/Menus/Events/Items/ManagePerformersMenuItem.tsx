import React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface ManagePerformersMenuItemProps {
  eventID: string;
}

/**
 * Opens the performer management screen for an event. Navigation item, so no closeMenu; menus close
 * on navigation. Must render inside a MenuContextBridge.
 */
export const ManagePerformersMenuItem = ({eventID}: ManagePerformersMenuItemProps) => {
  const navigation = useCommonStack();
  return (
    <Menu.Item
      title={'Manage Performers'}
      leadingIcon={AppIcons.twitarrteam}
      onPress={() => navigation.push(CommonStackComponents.eventPerformersManageScreen, {eventID})}
    />
  );
};
