import React from 'react';
import {View} from 'react-native';
import {Badge} from 'react-native-paper';
import {commonStyles} from '../../Styles';
import {RelativeTimeTag} from './Tags/RelativeTimeTag';

export const SeamailTimeBadge = ({date, badgeCount}: {date: string; badgeCount: number}) => {
  const timeStyle = badgeCount ? [commonStyles.bold] : undefined;
  return (
    <View style={commonStyles.verticalContainer}>
      <View style={commonStyles.flexRow}>
        <RelativeTimeTag date={new Date(date)} style={timeStyle} />
        {!!badgeCount && <Badge style={commonStyles.marginLeftSmall}>{badgeCount}</Badge>}
      </View>
    </View>
  );
};
