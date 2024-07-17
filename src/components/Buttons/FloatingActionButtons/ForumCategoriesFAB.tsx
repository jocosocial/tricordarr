import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';
import {BaseFABGroup} from './BaseFABGroup';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import React from 'react';

interface ForumFABProps {
  openLabel?: string;
  icon?: IconSource;
}

export const ForumCategoriesFAB = ({openLabel = 'Forum Categories', icon}: ForumFABProps) => {
  const navigation = useForumStackNavigation();

  const actions = [
    FabGroupAction({
      icon: AppIcons.postSearch,
      label: 'Search Posts',
      onPress: () => navigation.push(ForumStackComponents.forumPostSearchScreen),
    }),
    FabGroupAction({
      icon: AppIcons.search,
      label: 'Search Forums',
      onPress: () => navigation.push(ForumStackComponents.forumThreadSearchScreen, {}),
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={openLabel} icon={icon || AppIcons.forum} />;
};
