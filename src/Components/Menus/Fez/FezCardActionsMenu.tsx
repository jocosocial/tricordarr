import React from 'react';
import {Divider, Menu} from 'react-native-paper';

import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {MenuContextBridge, useMenuContextBridge} from '#src/Components/Menus/MenuContextBridge';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Libraries/Sharing';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {FezData} from '#src/Structs/ControllerStructs';

interface FezCardActionsMenuItemsProps {
  fezData: FezData;
  closeMenu: () => void;
}

/**
 * The items of an LFG's long-press actions menu, without the surrounding Menu. Shared by
 * FezCardActionsMenu (list cards, anchored on the card) and DayPlannerCardActionsMenu
 * (planner cards, anchored at the touch point) so both offer the same actions.
 * Must render inside a MenuContextBridge.
 */
export const FezCardActionsMenuItems = ({fezData, closeMenu}: FezCardActionsMenuItemsProps) => {
  const commonNavigation = useCommonStack();

  return (
    <>
      <Menu.Item
        title={'Overlapping'}
        leadingIcon={AppIcons.calendarMultiple}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.scheduleOverlapScreen, {eventData: fezData});
        }}
      />
      <Divider bold={true} />
      <ShareMenuItem contentType={ShareContentType.lfg} contentID={fezData.fezID} closeMenu={closeMenu} />
    </>
  );
};

interface FezCardActionsMenuProps {
  anchor: React.JSX.Element;
  fezData: FezData;
  menuVisible: boolean;
  closeMenu: () => void;
  setRefreshing?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Long-press actions menu for an LFG list card. Visibility is controlled by the caller (FezCard).
 */
export const FezCardActionsMenu = (props: FezCardActionsMenuProps) => {
  const bridged = useMenuContextBridge();
  return (
    <Menu visible={props.menuVisible} onDismiss={props.closeMenu} anchor={props.anchor}>
      <MenuContextBridge bridged={bridged}>
        <FezCardActionsMenuItems fezData={props.fezData} closeMenu={props.closeMenu} />
      </MenuContextBridge>
    </Menu>
  );
};
