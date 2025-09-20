import React from 'react';
import {View} from 'react-native';
import {Badge} from 'react-native-paper';

import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {commonStyles} from '#src/Styles';

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
