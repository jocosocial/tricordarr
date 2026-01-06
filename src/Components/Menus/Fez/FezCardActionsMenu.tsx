import React from 'react';
import {Divider, Menu} from 'react-native-paper';

import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {FezData} from '#src/Structs/ControllerStructs';

interface FezCardActionsMenuProps {
  anchor: React.JSX.Element;
  fezData: FezData;
  menuVisible: boolean;
  closeMenu: () => void;
  setRefreshing?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FezCardActionsMenu = (props: FezCardActionsMenuProps) => {
  const commonNavigation = useCommonStack();

  return (
    <Menu visible={props.menuVisible} onDismiss={props.closeMenu} anchor={props.anchor}>
      <Menu.Item
        title={'Overlapping'}
        leadingIcon={AppIcons.calendarMultiple}
        onPress={() => {
          props.closeMenu();
          commonNavigation.push(CommonStackComponents.scheduleOverlapScreen, {eventData: props.fezData});
        }}
      />
      <Divider bold={true} />
      <ShareMenuItem contentType={ShareContentType.lfg} contentID={props.fezData.fezID} closeMenu={props.closeMenu} />
    </Menu>
  );
};
