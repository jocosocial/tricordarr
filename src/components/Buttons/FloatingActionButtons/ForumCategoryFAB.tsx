import * as React from 'react';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator';
import {CategoryData} from '../../../libraries/Structs/ControllerStructs.tsx';
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
