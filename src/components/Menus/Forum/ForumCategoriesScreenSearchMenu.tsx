import React from 'react';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation.ts';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator.tsx';

export const ForumCategoriesScreenSearchMenu = () => {
  const [visible, setVisible] = React.useState(false);
  const forumNavigation = useForumStackNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Search'} iconName={AppIcons.search} onPress={openMenu} />}>
      <Menu.Item
        dense={false}
        title={'Search Posts'}
        leadingIcon={AppIcons.postSearch}
        onPress={() => {
          closeMenu();
          forumNavigation.push(CommonStackComponents.forumPostSearchScreen, {});
        }}
      />
      <Menu.Item
        dense={false}
        title={'Search Forums'}
        leadingIcon={AppIcons.search}
        onPress={() => {
          closeMenu();
          forumNavigation.push(ForumStackComponents.forumThreadSearchScreen, {});
        }}
      />
    </Menu>
  );
};