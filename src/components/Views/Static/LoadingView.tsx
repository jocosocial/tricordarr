import React from 'react';
import {View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const LoadingView = () => {
  const {commonStyles} = useStyles();
  return (
    <View>
      <ScrollingContentView>
        <ActivityIndicator />
        <View
          style={[
            commonStyles.flex,
            commonStyles.justifyCenter,
            commonStyles.alignItemsCenter,
            commonStyles.marginTop,
          ]}>
          <Text>Loading...</Text>
        </View>
      </ScrollingContentView>
    </View>
  );
};
