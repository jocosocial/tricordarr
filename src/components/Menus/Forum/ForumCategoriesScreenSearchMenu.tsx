import React from 'react';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '#src/Enums/Icons';
import {ForumStackComponents, useForumStackNavigation} from '#src/Navigation/Stacks/ForumStackNavigator';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu';

export const ForumCategoriesScreenSearchMenu = () => {
  const [visible, setVisible] = React.useState(false);
  const forumNavigation = useForumStackNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <AppHeaderMenu
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
    </AppHeaderMenu>
  );
};
