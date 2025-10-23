import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/MenuHook';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const PerformerListActionsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {hasTwitarrTeam} = usePrivilege();
  const navigation = useCommonStack();

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}
    >
      {hasTwitarrTeam && (
        <>
          <Menu.Item
            title={'Add Performer'}
            leadingIcon={AppIcons.twitarteam}
            onPress={() => {
              navigation.push(CommonStackComponents.siteUIScreen, {
                resource: 'performer/add',
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
    </AppHeaderMenu>
  );
};
