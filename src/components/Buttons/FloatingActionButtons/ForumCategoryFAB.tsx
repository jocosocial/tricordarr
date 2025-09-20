import * as React from 'react';
import {ForumStackComponents, useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator.tsx';
import {CategoryData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {BaseFAB} from './BaseFAB.tsx';

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
