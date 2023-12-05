import {Text} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';

export const ListTitleView = ({title}: {title?: string}) => {
  const {commonStyles} = useStyles();
  if (!title) {
    return null;
  }
  return (
    <View style={[commonStyles.flexRow, commonStyles.paddingVerticalSmall, commonStyles.paddingHorizontal]}>
      <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
        <Text style={[commonStyles.bold]}>{title}</Text>
      </View>
    </View>
  );
};
