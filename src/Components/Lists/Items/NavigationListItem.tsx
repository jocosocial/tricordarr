import {ParamListBase, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {ReactNode, useMemo} from 'react';
import {StyleSheet} from 'react-native';

import {ForumNewBadge} from '#src/Components/Badges/ForumNewBadge';
import {ListItem} from '#src/Components/Lists/ListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface NavigationListItemBaseProps {
  title: string;
  description: string;
  params?: object;
  right?: () => ReactNode;
  unreadCount?: number;
  unreadUnit?: string;
  bold?: boolean;
}

/**
 * Require one of `navComponent` or `onPress`.
 */
type NavigationListItemProps = NavigationListItemBaseProps &
  ({navComponent: string; onPress?: () => void} | {navComponent?: string; onPress: () => void});

/**
 * List row that either pushes a screen on the current navigation stack or runs a custom press handler.
 * At least one of `navComponent` or `onPress` is required.
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
  onPress,
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

  /**
   * Invoke `onPress` when provided; otherwise push `navComponent`.
   */
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (navComponent) {
      (navigation.push as (name: string, params?: object) => void)(navComponent, params);
    }
  };

  return (
    <ListItem
      title={title}
      titleStyle={styles.title}
      description={description}
      onPress={handlePress}
      right={right || unreadCount ? getRight : undefined}
    />
  );
};
