import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {MD3TypescaleKey} from 'react-native-paper/src/types';

import {BoldText} from '#src/Components/Text/BoldText';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface ListTitleViewProps {
  title?: string;
  subtitle?: string;
  subtitleVariant?: keyof typeof MD3TypescaleKey;
  icon?: React.ReactNode;
  onSubtitlePress?: () => void;
}

/**
 * Banner title for list-style screens. Optional subtitle can be a tappable link.
 */
export const ListTitleView = ({
  title,
  subtitle,
  subtitleVariant = 'bodySmall',
  icon,
  onSubtitlePress,
}: ListTitleViewProps) => {
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
        text: {
          ...commonStyles.onBackground,
        },
        subtitleLink: {
          ...commonStyles.onBackground,
          ...commonStyles.linkText,
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
              <BoldText>{title}</BoldText>
            </View>
            {icon}
          </View>
        ) : (
          <BoldText>{title}</BoldText>
        )}
        {subtitle && (
          <Text
            style={onSubtitlePress ? styles.subtitleLink : styles.text}
            variant={subtitleVariant}
            onPress={onSubtitlePress}
            accessibilityRole={onSubtitlePress ? 'link' : undefined}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};
