import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {Menu} from 'react-native-paper';
import * as React from 'react';
import {ChatStackScreenComponents, useChatStack} from '../../Navigation/Stacks/ChatStackNavigator.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';

export const SeamailListScreenActionsMenu = () => {
  const [visible, setVisible] = React.useState(false);
  const navigation = useChatStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        leadingIcon={AppIcons.settings}
        title={'Settings'}
        onPress={() => {
          closeMenu();
          navigation.push(ChatStackScreenComponents.seamailSettingsScreen);
        }}
      />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.seamailHelpScreen);
        }}
      />
    </AppHeaderMenu>
  );
};
