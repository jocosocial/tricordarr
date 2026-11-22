import * as React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {CategoryData} from '#src/Structs/ControllerStructs';

interface ForumFABProps {
  category: CategoryData;
  showLabel?: boolean;
}

export const ForumCategoryFAB = ({category, showLabel}: ForumFABProps) => {
  const navigation = useCommonStack();
  return (
    <BaseFAB
      onPress={() =>
        navigation.push(CommonStackComponents.forumThreadCreateScreen, {
          categoryId: category.categoryID,
        })
      }
      label={'New Forum'}
      showLabel={showLabel}
      testID={'forumCreate-fab'}
    />
  );
};
