import {Text} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';

interface ListTitleViewProps {
  title?: string;
  subtitle?: string;
}

export const ListTitleView = ({title, subtitle}: ListTitleViewProps) => {
  const {commonStyles} = useStyles();
  if (!title) {
    return null;
  }
  return (
    <View
      style={[
        commonStyles.flexRow,
        commonStyles.paddingVerticalSmall,
        commonStyles.paddingHorizontal,
        commonStyles.surfaceVariant,
      ]}>
      <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
        <Text style={[commonStyles.bold]}>{title}</Text>
        {subtitle && <Text>{subtitle}</Text>}
      </View>
    </View>
  );
};
