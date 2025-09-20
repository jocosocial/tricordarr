import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {Divider, Menu} from 'react-native-paper';
import React from 'react';
import {useState} from 'react';
import {usePrivilege} from '#src/Components/Context/Contexts/PrivilegeContext.ts';
import {CommonStackComponents, useCommonStack} from '#src/Components/Navigation/CommonScreens.tsx';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu.tsx';

export const PerformerListActionsMenu = () => {
  const [visible, setVisible] = useState(false);
  const {hasTwitarrTeam} = usePrivilege();
  const navigation = useCommonStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
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
