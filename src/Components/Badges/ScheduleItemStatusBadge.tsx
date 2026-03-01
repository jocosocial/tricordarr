import React from 'react';
import {StyleSheet} from 'react-native';
import {Badge} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface ScheduleItemStatusBadgeProps {
  align?: 'left' | 'right';
  status?: string;
}

/**
 * Show the status of a schedule item. Typically used in the upper right corner of a ScheduleItemCard.
 */
export const ScheduleItemStatusBadge = ({align, status}: ScheduleItemStatusBadgeProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    badge: {
      ...commonStyles.bold,
      ...commonStyles.paddingHorizontalSmall,
      ...(align === 'left' ? commonStyles.flexStart : align === 'right' ? commonStyles.flexEnd : undefined),
    },
  });

  if (!status) {
    return null;
  }

  return <Badge style={styles.badge}>{status}</Badge>;
};
