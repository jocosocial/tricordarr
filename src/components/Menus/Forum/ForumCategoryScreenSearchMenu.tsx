import React from 'react';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {ForumStackComponents, useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator.tsx';
import {CategoryData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';

interface ForumCategoryScreenSearchMenuProps {
  category: CategoryData;
}

export const ForumCategoryScreenSearchMenu = (props: ForumCategoryScreenSearchMenuProps) => {
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
