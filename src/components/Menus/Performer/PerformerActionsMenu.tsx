import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {Divider, Menu} from 'react-native-paper';
import * as React from 'react';
import {useState} from 'react';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {MainStackComponents, useMainStack} from '../../Navigation/Stacks/MainStackNavigator.tsx';

interface PerformerActionsMenuProps {
  id: string;
}

export const PerformerActionsMenu = ({id}: PerformerActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {hasTwitarrTeam} = usePrivilege();
  const mainNavigation = useMainStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      {hasTwitarrTeam && (
        <>
          <Menu.Item
            title={'Edit Performer'}
            leadingIcon={AppIcons.twitarteam}
            onPress={() => {
              mainNavigation.push(CommonStackComponents.siteUIScreen, {
                resource: 'performer',
                id: `add?performer=${id}`,
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
          mainNavigation.push(MainStackComponents.performerHelpScreen);
        }}
      />
    </Menu>
  );
};
