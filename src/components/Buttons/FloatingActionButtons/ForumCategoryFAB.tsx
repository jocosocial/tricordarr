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
      icon: AppIcons.favorite,
      label: 'Favorite Forums',
      onPress: () => console.log('woo'),
    }),
    FabGroupAction({
      icon: AppIcons.time,
      label: 'Recent Forums',
      onPress: () => console.log('woo'),
    }),
    FabGroupAction({
      icon: AppIcons.user,
      label: 'Forums You Created',
      onPress: () => console.log('woo'),
    }),
    FabGroupAction({
      icon: AppIcons.mute,
      label: 'Muted Forums',
      onPress: () => console.log('woo'),
    }),
    FabGroupAction({
      icon: AppIcons.favorite,
      label: 'Favorite Posts',
      onPress: () => console.log('woo'),
    }),
    FabGroupAction({
      icon: AppIcons.postSelf,
      label: 'Posts You Wrote',
      onPress: () => console.log('woo'),
    }),
    FabGroupAction({
      icon: AppIcons.postMention,
      label: 'Posts Mentioning You',
      onPress: () => console.log('woo'),
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={'Forum Categories'} icon={AppIcons.forum} />;
};
