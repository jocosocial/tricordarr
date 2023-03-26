import React from 'react';
import {View} from 'react-native';
import {Badge} from 'react-native-paper';
import {commonStyles} from '../../../styles';
import {RelativeTimeTag} from '../../Text/RelativeTimeTag';

export const SeamailTimeBadge = ({date, badgeCount}: {date: Date; badgeCount: number}) => {
  return (
    <View style={commonStyles.verticalCenterContainer}>
      <View style={commonStyles.flexRow}>
        <RelativeTimeTag date={date} bold={!!badgeCount} />
        {!!badgeCount && <Badge style={commonStyles.marginLeftSmall}>{badgeCount}</Badge>}
      </View>
    </View>
  );
};
