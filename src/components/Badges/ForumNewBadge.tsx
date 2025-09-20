import {Badge} from 'react-native-paper';
import pluralize from 'pluralize';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {commonStyles} from '#src/Styles';

interface ForumNewBadgeProps {
  unreadCount?: number;
  unit?: string;
}

export const ForumNewBadge = ({unreadCount, unit}: ForumNewBadgeProps) => {
  const styles = StyleSheet.create({
    badge: {
      ...commonStyles.bold,
      ...commonStyles.paddingHorizontalSmall,
    },
    badgeContainer: {
      ...commonStyles.justifyCenter,
    },
  });

  if (!unreadCount) {
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
