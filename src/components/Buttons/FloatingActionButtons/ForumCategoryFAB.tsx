import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';
import {BaseFABGroup} from './BaseFABGroup';
import {useForumStackNavigation, useForumStackRoute} from '../../Navigation/Stacks/ForumStackNavigator';

export const ForumCategoryFAB = () => {
  const navigation = useForumStackNavigation();
  const route = useForumStackRoute();

  const handleNavigation = (component: ForumStackComponents) => {
    if (route.name === component) {
      return;
    }
    navigation.push(component);
  };

  const actions = [
    FabGroupAction({
      icon: AppIcons.postSearch,
      label: 'Search Posts',
      onPress: () => console.log('woo'),
    }),
    FabGroupAction({
      icon: AppIcons.search,
      label: 'Search Forums',
      onPress: () => console.log('woo'),
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={'Forum Categories'} icon={AppIcons.forum} />;
};
