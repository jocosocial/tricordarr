import {Text} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

export const NoResultsHeader = () => {
  const {commonStyles} = useStyles();

  return (
    <View key={'noResults'} style={[commonStyles.paddingSmall]}>
      <Text>No Results</Text>
    </View>
  );
};
