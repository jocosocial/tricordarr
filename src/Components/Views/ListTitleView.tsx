import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {MD3TypescaleKey} from 'react-native-paper/src/types';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface ListTitleViewProps {
  title?: string;
  subtitle?: string;
  subtitleVariant?: keyof typeof MD3TypescaleKey;
  icon?: React.ReactNode;
}

// @TODO dedupe with BaseWarningView
export const ListTitleView = ({title, subtitle, subtitleVariant = 'bodySmall', icon}: ListTitleViewProps) => {
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          ...commonStyles.flexRow,
          ...commonStyles.paddingVerticalSmall,
          ...commonStyles.paddingHorizontal,
          ...commonStyles.surfaceVariant,
        },
        innerContainer: {
          ...commonStyles.alignItemsCenter,
          ...commonStyles.flex,
        },
        titleRow: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.justifyCenter,
          ...commonStyles.fullWidth,
          ...commonStyles.gapSmall,
        },
        title: {
          flexShrink: 1,
        },
        titleText: {
          ...commonStyles.bold,
          ...commonStyles.textCenter,
          ...commonStyles.fullWidth,
        },
        text: {
          ...commonStyles.onBackground,
          ...commonStyles.textCenter,
          ...commonStyles.fullWidth,
        },
      }),
    [commonStyles],
  );

  if (!title) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {icon ? (
          <View style={styles.titleRow}>
            <View style={styles.title}>
              <Text style={styles.titleText}>{title}</Text>
            </View>
            {icon}
          </View>
        ) : (
          <Text style={styles.titleText}>{title}</Text>
        )}
        {subtitle && (
          <Text style={styles.text} variant={subtitleVariant}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};
