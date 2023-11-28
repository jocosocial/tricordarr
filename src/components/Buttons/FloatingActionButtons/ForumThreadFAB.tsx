import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';
import {BaseFABGroup} from './BaseFABGroup';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator';

export const ForumThreadFAB = () => {
  const navigation = useForumStackNavigation();

  const actions = [
    FabGroupAction({
      icon: AppIcons.new,
      label: 'New Forum',
      onPress: () => console.log('newforum'),
    }),
    FabGroupAction({
      icon: AppIcons.postSearch,
      label: 'Search Posts',
      onPress: () => navigation.push(ForumStackComponents.forumPostSearchScreen),
    }),
    FabGroupAction({
      icon: AppIcons.search,
      label: 'Search Forums',
      onPress: () => navigation.push(ForumStackComponents.forumThreadSearchScreen),
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={'Forums'} icon={AppIcons.forum} />;
};
