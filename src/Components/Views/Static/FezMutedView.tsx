import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

export const FezMutedView = () => {
  const {commonStyles} = useStyles();
  return (
    <View style={[commonStyles.error, commonStyles.flexRow, commonStyles.paddingVertical]}>
      <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
        <Text style={[commonStyles.onError, commonStyles.bold]}>You have muted this chat.</Text>
        <Text style={[commonStyles.onError, commonStyles.bold]}>You will not receive notifications for posts.</Text>
      </View>
    </View>
  );
};
