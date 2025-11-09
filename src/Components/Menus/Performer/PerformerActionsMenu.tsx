import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/MenuHook';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {PerformerData} from '#src/Structs/ControllerStructs';

interface PerformerActionsMenuProps {
  performerData?: PerformerData;
}

export const PerformerActionsMenu = ({performerData}: PerformerActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {hasTwitarrTeam, hasModerator} = usePrivilege();
  const navigation = useCommonStack();

  // TypeScript + JSX = silly
  const creatorID = performerData?.user?.userID;
  const performerID = performerData?.header.id;

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      {hasModerator && creatorID && (
        <>
          <Menu.Item
            title={'View Creator Profile'}
            leadingIcon={AppIcons.moderator}
            onPress={() => {
              navigation.push(CommonStackComponents.userProfileScreen, {
                userID: creatorID,
              });
              closeMenu();
            }}
          />
          <Divider bold={true} />
        </>
      )}
      {hasTwitarrTeam && performerID && (
        <>
          <Menu.Item
            title={'Edit Performer'}
            leadingIcon={AppIcons.twitarteam}
            onPress={() => {
              navigation.push(CommonStackComponents.siteUIScreen, {
                resource: 'performer',
                id: `add?performer=${performerID}`,
                admin: true,
              });
              closeMenu();
            }}
          />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.performerHelpScreen);
        }}
      />
    </AppMenu>
  );
};
