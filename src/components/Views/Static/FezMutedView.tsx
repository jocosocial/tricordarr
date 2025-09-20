import {Text} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';

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
