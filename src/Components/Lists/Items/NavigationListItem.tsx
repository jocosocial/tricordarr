import {ParamListBase, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {ReactNode, useMemo} from 'react';
import {StyleSheet} from 'react-native';

import {ForumNewBadge} from '#src/Components/Badges/ForumNewBadge';
import {ListItem} from '#src/Components/Lists/ListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface NavigationListItemProps {
  title: string;
  description: string;
  navComponent: string;
  params?: object;
  right?: () => ReactNode;
  unreadCount?: number;
  unreadUnit?: string;
  bold?: boolean;
}

/**
 * List row that pushes a screen on the current navigation stack.
 */
export const NavigationListItem = ({
  title,
  description,
  navComponent,
  params,
  right,
  unreadCount,
  unreadUnit,
  bold,
}: NavigationListItemProps) => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const {commonStyles} = useStyles();
  const isBold = bold ?? !!unreadCount;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          ...(isBold ? commonStyles.bold : undefined),
        },
      }),
    [commonStyles, isBold],
  );

  const getRight = () => {
    if (right) {
      return right();
    }
    return <ForumNewBadge unreadCount={unreadCount} unit={unreadUnit} />;
  };

  return (
    <ListItem
      title={title}
      titleStyle={styles.title}
      description={description}
      onPress={() => (navigation.push as (name: string, params?: object) => void)(navComponent, params)}
      right={right || unreadCount ? getRight : undefined}
    />
  );
};
