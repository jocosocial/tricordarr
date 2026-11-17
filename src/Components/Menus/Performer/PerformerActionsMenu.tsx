import React from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {PrivilegedMenuGroup} from '#src/Components/Menus/PrivilegedMenuGroup';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {ShareContentType} from '#src/Libraries/Sharing';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {PerformerData} from '#src/Structs/ControllerStructs';

interface PerformerActionsMenuProps {
  performerData?: PerformerData;
  performerID: string;
}

export const PerformerActionsMenu = ({performerData, performerID}: PerformerActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {hasTwitarrTeam, hasModerator} = usePrivilege();
  const navigation = useCommonStack();

  // TypeScript + JSX = silly
  const creatorID = performerData?.user?.userID;

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <PrivilegedMenuGroup leadingDivider={false}>
        {hasModerator && creatorID && (
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
        )}
        {hasTwitarrTeam && (
          <Menu.Item
            title={'Edit Performer'}
            leadingIcon={AppIcons.twitarrteam}
            onPress={() => {
              navigation.push(CommonStackComponents.siteUIScreen, {
                resource: 'performer',
                id: `add?performer=${performerID}`,
                admin: true,
              });
              closeMenu();
            }}
          />
        )}
      </PrivilegedMenuGroup>
      <ShareMenuItem contentType={ShareContentType.performer} contentID={performerID} closeMenu={closeMenu} />
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
