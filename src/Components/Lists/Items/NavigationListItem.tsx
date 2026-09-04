import {ParamListBase, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';

import {ListItem} from '#src/Components/Lists/ListItem';

interface NavigationListItemProps {
  title: string;
  description: string;
  navComponent: string;
  params?: object;
}

/**
 * List row that pushes a screen on the current navigation stack.
 */
export const NavigationListItem = ({title, description, navComponent, params}: NavigationListItemProps) => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

  return (
    <ListItem
      title={title}
      description={description}
      onPress={() => (navigation.push as (name: string, params?: object) => void)(navComponent, params)}
    />
  );
};
