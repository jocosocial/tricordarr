import React from 'react';
import {Text} from 'react-native-paper';
import {CategoryData} from '../../../../libraries/Structs/ControllerStructs';
import {useForumStackNavigation} from '../../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents} from '../../../../libraries/Enums/Navigation';
import {ForumCategoryListItemBase} from './ForumCategoryListItemBase';

interface ForumCategoryListItemProps {
  category: CategoryData;
}

export const ForumCategoryListItem = ({category}: ForumCategoryListItemProps) => {
  const forumNavigation = useForumStackNavigation();

  const getThreadCount = () => <Text variant={'bodyMedium'}>{category.numThreads} threads</Text>;
  const onPress = () =>
    forumNavigation.push(ForumStackComponents.forumCategoryScreen, {category: category});

  return (
    <ForumCategoryListItemBase
      title={category.title}
      description={category.purpose}
      onPress={onPress}
      right={getThreadCount}
    />
  );
};
