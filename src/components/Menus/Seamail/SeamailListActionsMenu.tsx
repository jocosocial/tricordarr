import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Menu} from 'react-native-paper';
import * as React from 'react';
import {ChatStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useChatStack} from '../../Navigation/Stacks/ChatStackNavigator.tsx';

export const SeamailListActionsMenu = () => {
  const [visible, setVisible] = React.useState(false);
  const navigation = useChatStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          closeMenu();
          navigation.push(ChatStackScreenComponents.seamailHelpScreen);
        }}
      />
    </Menu>
  );
};
