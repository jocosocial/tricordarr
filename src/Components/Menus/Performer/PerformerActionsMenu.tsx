import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
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
      <ShareMenuItem contentType={ShareContentType.performer} contentID={performerID} closeMenu={closeMenu} />
      {((hasModerator && creatorID) || hasTwitarrTeam) && <Divider bold={true} />}
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
      {hasTwitarrTeam && (
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
