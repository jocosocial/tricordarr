import React from 'react';
import {Text} from 'react-native-paper';

import {ForumCategoryListItemBase} from '#src/Components/Lists/Items/Forum/ForumCategoryListItemBase';
import {ForumStackComponents, useForumStackNavigation} from '#src/Navigation/Stacks/ForumStackNavigator';
import {CategoryData} from '#src/Structs/ControllerStructs';

interface ForumCategoryListItemProps {
  category: CategoryData;
}

export const ForumCategoryListItem = ({category}: ForumCategoryListItemProps) => {
  const forumNavigation = useForumStackNavigation();

  const getThreadCount = () => <Text variant={'bodyMedium'}>{category.paginator.total} threads</Text>;
  const onPress = () => forumNavigation.push(ForumStackComponents.forumCategoryScreen, {category: category});

  return (
    <ForumCategoryListItemBase
      title={category.title}
      description={category.purpose}
      onPress={onPress}
      right={getThreadCount}
    />
  );
};
