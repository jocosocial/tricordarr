import React from 'react';
import {StyleSheet} from 'react-native';
import {Badge} from 'react-native-paper';

import {commonStyles} from '#src/Styles';

interface CancelledBadgeProps {
  align?: 'left' | 'right';
}

const styles = StyleSheet.create({
  badge: {
    ...commonStyles.bold,
    ...commonStyles.paddingHorizontalSmall,
  },
  alignLeft: {
    ...commonStyles.flexStart,
  },
  alignRight: {
    ...commonStyles.flexEnd,
  },
});

export const CancelledBadge = ({align}: CancelledBadgeProps) => {
  const alignStyle = align === 'left' ? styles.alignLeft : align === 'right' ? styles.alignRight : undefined;
  return <Badge style={[styles.badge, alignStyle]}>Cancelled</Badge>;
};
