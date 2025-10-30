import React from 'react';
import {View} from 'react-native';
import {Badge, Text} from 'react-native-paper';

import {commonStyles} from '#src/Styles';
import pluralize from 'pluralize';

export const SeamailMessageCountIndicator = ({totalPostCount, badgeCount}: {totalPostCount: number, badgeCount: number}) => {
  return (
    <View style={commonStyles.verticalContainer}>
      <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter]}>
        <Text variant={'bodySmall'}>
          {totalPostCount} {pluralize('messages', totalPostCount)}
        </Text> 
        {
          !!badgeCount && 
          <Badge style={[commonStyles.marginLeftSmall, commonStyles.paddingHorizontalSmall, commonStyles.bold]}>{badgeCount} new</Badge>
        } 
      </View>
    </View>
  );
};
