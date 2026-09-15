import pluralize from 'pluralize';
import React from 'react';
import {Text} from 'react-native-paper';

import {ForumCategoryListItemBase} from '#src/Components/Lists/Items/Forum/ForumCategoryListItemBase';
import {ForumStackComponents, useForumStackNavigation} from '#src/Navigation/Stacks/Forum/ForumStackComponents';
import {CategoryData} from '#src/Structs/ControllerStructs';

interface ForumCategoryListItemProps {
  category: CategoryData;
}

/**
 * Category row on the forums index. Navigates by `categoryID` so the destination
 * matches `/forums/:categoryID` deep links.
 */
export const ForumCategoryListItem = ({category}: ForumCategoryListItemProps) => {
  const forumNavigation = useForumStackNavigation();

  const getThreadCount = () => (
    <Text variant={'bodyMedium'}>
      {category.paginator.total} {pluralize('thread', category.paginator.total)}
    </Text>
  );
  const onPress = () =>
    forumNavigation.push(ForumStackComponents.forumCategoryScreen, {categoryID: category.categoryID});

  return (
    <ForumCategoryListItemBase
      title={category.title}
      description={category.purpose}
      onPress={onPress}
      right={getThreadCount}
    />
  );
};
