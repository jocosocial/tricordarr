import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useFezAlert} from '#src/Hooks/Fez/useFezAlert';
import {useMenu} from '#src/Hooks/useMenu';
import {ShareContentType} from '#src/Libraries/Sharing';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useLFGStackNavigation} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {FezData} from '#src/Structs/ControllerStructs';

export const LfgScreenActionsMenu = ({fezData}: {fezData: FezData}) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useLFGStackNavigation();
  const commonNavigation = useCommonStack();
  const {hasModerator} = usePrivilege();
  const {currentUserID} = useSession();
  const {confirmCancel} = useFezAlert(fezData);

  const menuAnchor = <Item title={'LFG Menu'} iconName={AppIcons.menu} onPress={openMenu} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        title={'Overlapping'}
        leadingIcon={AppIcons.calendarMultiple}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.scheduleOverlapScreen, {eventData: fezData});
        }}
      />
      <Divider bold={true} />
      {fezData.owner.userID === currentUserID && (
        <Menu.Item
          leadingIcon={AppIcons.cancel}
          title={'Cancel'}
          onPress={() => {
            closeMenu();
            confirmCancel();
          }}
          disabled={fezData.cancelled}
        />
      )}
      <ShareMenuItem contentType={ShareContentType.lfg} contentID={fezData.fezID} closeMenu={closeMenu} />
      <Menu.Item
        leadingIcon={AppIcons.report}
        title={'Report'}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.reportScreen, {
            contentType: ReportContentType.fez,
            contentID: fezData.fezID,
          });
        }}
      />
      {hasModerator && (
        <Menu.Item
          leadingIcon={AppIcons.moderator}
          title={'Moderate'}
          onPress={() => {
            navigation.push(CommonStackComponents.siteUIScreen, {
              resource: 'lfg',
              id: fezData.fezID,
              moderate: true,
            });
            closeMenu();
          }}
        />
      )}
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          navigation.push(CommonStackComponents.lfgHelpScreen);
          closeMenu();
        }}
      />
    </AppMenu>
  );
};
