import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';
import {BaseFABGroup} from './BaseFABGroup';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {CategoryData} from '../../../libraries/Structs/ControllerStructs.tsx';

interface ForumFABProps {
  category: CategoryData;
  openLabel?: string;
  icon?: IconSource;
  showLabel?: boolean;
}

export const ForumCategoryFAB = ({category, openLabel = 'Forum Category', icon, showLabel}: ForumFABProps) => {
  const navigation = useForumStackNavigation();

  const actions = [
    FabGroupAction({
      icon: AppIcons.new,
      label: 'New Forum',
      onPress: () =>
        navigation.push(ForumStackComponents.forumThreadCreateScreen, {
          categoryId: category.categoryID,
        }),
    }),
    FabGroupAction({
      icon: AppIcons.search,
      label: 'Search Posts',
      onPress: () =>
        navigation.push(ForumStackComponents.forumPostSearchScreen, {
          category: category,
        }),
    }),
    FabGroupAction({
      icon: AppIcons.search,
      label: 'Search Forums',
      onPress: () =>
        navigation.push(ForumStackComponents.forumThreadSearchScreen, {
          category: category,
        }),
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={openLabel} icon={icon || AppIcons.forum} showLabel={showLabel} />;
};
