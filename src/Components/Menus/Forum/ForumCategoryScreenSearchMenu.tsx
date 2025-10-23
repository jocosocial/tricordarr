import React from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/MenuHook';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ForumStackComponents, useForumStackNavigation} from '#src/Navigation/Stacks/ForumStackNavigator';
import {CategoryData} from '#src/Structs/ControllerStructs';

interface ForumCategoryScreenSearchMenuProps {
  category: CategoryData;
}

export const ForumCategoryScreenSearchMenu = (props: ForumCategoryScreenSearchMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const forumNavigation = useForumStackNavigation();

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Search'} iconName={AppIcons.search} onPress={openMenu} />}
    >
      <Menu.Item
        dense={false}
        title={'Search Posts'}
        leadingIcon={AppIcons.postSearch}
        onPress={() => {
          closeMenu();
          forumNavigation.push(CommonStackComponents.forumPostSearchScreen, {
            category: props.category,
          });
        }}
      />
      <Menu.Item
        dense={false}
        title={'Search Forums'}
        leadingIcon={AppIcons.search}
        onPress={() => {
          closeMenu();
          forumNavigation.push(ForumStackComponents.forumThreadSearchScreen, {
            category: props.category,
          });
        }}
      />
    </AppHeaderMenu>
  );
};
