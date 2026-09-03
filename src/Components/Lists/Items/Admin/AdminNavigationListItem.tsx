import React from 'react';

import {ListItem} from '#src/Components/Lists/ListItem';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface AdminNavigationListItemProps {
  title: string;
  description: string;
  navComponent: CommonStackComponents;
  params?: object;
}

/**
 * List row that pushes an admin screen on the common stack.
 */
export const AdminNavigationListItem = ({title, description, navComponent, params}: AdminNavigationListItemProps) => {
  const navigation = useCommonStack();

  return (
    <ListItem
      title={title}
      description={description}
      onPress={() =>
        (navigation.push as (name: keyof CommonStackParamList, params?: object) => void)(navComponent, params)
      }
    />
  );
};
