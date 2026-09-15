import pluralize from 'pluralize';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Badge} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface ForumNewBadgeProps {
  unreadCount?: number;
  unit?: string;
}

/**
 * Badge shown on forum list rows when a thread has unread posts.
 * Hides when the count is missing, zero, or negative (stale cache).
 */
export const ForumNewBadge = ({unreadCount, unit}: ForumNewBadgeProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    badge: {
      ...commonStyles.bold,
      ...commonStyles.paddingHorizontalSmall,
    },
    badgeContainer: {
      ...commonStyles.justifyCenter,
    },
  });

  // Negative unread is a cache invariant violation; hide rather than show "-N new".
  if (!unreadCount || unreadCount < 0) {
    return <></>;
  }

  let badgeText = `${unreadCount} new`;
  if (unit) {
    badgeText = `${badgeText} ${pluralize(unit, unreadCount)}`;
  }

  return (
    <View style={styles.badgeContainer}>
      <Badge style={styles.badge}>{badgeText}</Badge>
    </View>
  );
};
