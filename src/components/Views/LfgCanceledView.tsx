import {Text} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';

export const LfgCanceledView = () => {
  const {commonStyles} = useStyles();
  return (
    <View style={[commonStyles.error, commonStyles.flexRow, commonStyles.paddingVertical]}>
      <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
        <Text style={[commonStyles.onError, commonStyles.bold]}>This LFG has been cancelled</Text>
      </View>
    </View>
  );
};
