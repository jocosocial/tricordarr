import React from 'react';
import {View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {AppView} from '../AppView';

export const LoadingView = () => {
  const {commonStyles} = useStyles();
  return (
    <AppView>
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
    </AppView>
  );
};
