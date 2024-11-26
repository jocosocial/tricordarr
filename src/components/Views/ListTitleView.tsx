import {Text} from 'react-native-paper';
import {View, StyleSheet} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {BoldText} from '../Text/BoldText.tsx';
import {MD3TypescaleKey} from 'react-native-paper/src/types.tsx';

interface ListTitleViewProps {
  title?: string;
  subtitle?: string;
  subtitleVariant?: keyof typeof MD3TypescaleKey;
}

export const ListTitleView = ({title, subtitle, subtitleVariant = 'bodySmall'}: ListTitleViewProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    container: {
      ...commonStyles.flexRow,
      ...commonStyles.paddingVerticalSmall,
      ...commonStyles.paddingHorizontal,
      ...commonStyles.surfaceVariant,
      ...commonStyles.listTitleHeader,
    },
    innerContainer: {
      ...commonStyles.alignItemsCenter,
      ...commonStyles.flex,
    },
  });

  if (!title) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <BoldText>{title}</BoldText>
        {subtitle && <Text variant={subtitleVariant}>{subtitle}</Text>}
      </View>
    </View>
  );
};
