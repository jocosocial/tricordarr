import pluralize from 'pluralize';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Badge, Text} from 'react-native-paper';

import {commonStyles} from '#src/Styles';

export const SeamailMessageCountIndicator = ({
  totalPostCount,
  badgeCount,
}: {
  totalPostCount: number;
  badgeCount: number;
}) => {
  const styles = StyleSheet.create({
    container: {
      ...commonStyles.verticalContainer,
    },
    textContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
    },
    text: {
      ...(badgeCount ? commonStyles.bold : undefined),
    },
    badge: {
      ...commonStyles.marginLeftSmall,
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.bold,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text variant={'bodyMedium'} style={styles.text}>
          {totalPostCount} {pluralize('messages', totalPostCount)}
        </Text>
        {!!badgeCount && <Badge style={styles.badge}>{`${badgeCount} new`}</Badge>}
      </View>
    </View>
  );
};
