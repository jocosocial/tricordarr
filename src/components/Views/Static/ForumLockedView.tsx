import {Text} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import {usePrivilege} from '#src/Components/Context/Contexts/PrivilegeContext';

export const ForumLockedView = () => {
  const {commonStyles} = useStyles();
  const {hasModerator} = usePrivilege();
  return (
    <View style={[commonStyles.error, commonStyles.flexRow, commonStyles.paddingVertical]}>
      <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
        <Text style={[commonStyles.onError, commonStyles.bold]}>This forum has been locked.</Text>
        {hasModerator && (
          <Text style={[commonStyles.onError, commonStyles.bold]}>Moderators can continue to post.</Text>
        )}
      </View>
    </View>
  );
};
