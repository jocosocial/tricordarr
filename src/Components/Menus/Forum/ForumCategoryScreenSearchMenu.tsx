import React from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {CategoryData} from '#src/Structs/ControllerStructs';

interface ForumCategoryScreenSearchMenuProps {
  category: CategoryData;
}

export const ForumCategoryScreenSearchMenu = (props: ForumCategoryScreenSearchMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useCommonStack();

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Search'} iconName={AppIcons.search} onPress={openMenu} />}>
      <Menu.Item
        dense={false}
        title={'Search Posts'}
        leadingIcon={AppIcons.postSearch}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.forumPostSearchScreen, {
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
          navigation.push(CommonStackComponents.forumThreadSearchScreen, {
            category: props.category,
          });
        }}
      />
    </AppMenu>
  );
};
