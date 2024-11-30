import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import React from 'react';
import {Menu} from 'react-native-paper';
import {MainStackComponents, useMainStack} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';

export const PhotostreamActionsMenu = () => {
  const [visible, setVisible] = React.useState(false);
  const navigation = useMainStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        title={'Image Settings'}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.imageSettingsScreen);
        }}
        leadingIcon={AppIcons.settings}
      />
      <Menu.Item
        title={'Help'}
        onPress={() => {
          closeMenu();
          navigation.push(MainStackComponents.photostreamHelpScreen);
        }}
        leadingIcon={AppIcons.help}
      />
    </Menu>
  );
};
