import * as React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {ForumStackComponents, useForumStackNavigation} from '#src/Navigation/Stacks/ForumStackNavigator';
import {CategoryData} from '#src/Structs/ControllerStructs';

interface ForumFABProps {
  category: CategoryData;
  showLabel?: boolean;
}

export const ForumCategoryFAB = ({category, showLabel}: ForumFABProps) => {
  const forumNavigation = useForumStackNavigation();
  return (
    <BaseFAB
      onPress={() =>
        forumNavigation.push(ForumStackComponents.forumThreadCreateScreen, {
          categoryId: category.categoryID,
        })
      }
      label={'New Forum'}
      showLabel={showLabel}
    />
  );
};
