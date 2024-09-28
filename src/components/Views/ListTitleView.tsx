import {Text} from 'react-native-paper';
import {View, StyleSheet} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {BoldText} from '../Text/BoldText.tsx';

interface ListTitleViewProps {
  title?: string;
  subtitle?: string;
}

export const ListTitleView = ({title, subtitle}: ListTitleViewProps) => {
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
        {subtitle && <Text>{subtitle}</Text>}
      </View>
    </View>
  );
};
