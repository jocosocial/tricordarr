import React from 'react';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Menu} from 'react-native-paper';
import {ReloadMenuItem} from '../Items/ReloadMenuItem';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator.tsx';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation.ts';

interface ForumPostScreenBaseActionsMenuProps {
  onReload: () => void;
}

export const ForumPostScreenBaseActionsMenu = (props: ForumPostScreenBaseActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const forumNavigation = useForumStackNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <ReloadMenuItem closeMenu={closeMenu} onReload={props.onReload} />
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => {
          closeMenu();
          forumNavigation.push(ForumStackComponents.forumHelpScreen);
        }}
      />
    </Menu>
  );
};
