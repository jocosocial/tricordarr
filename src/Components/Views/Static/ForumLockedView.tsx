import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

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
