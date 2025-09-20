import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';

export const FlexCenteredContentView = (props: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return (
    <View style={[commonStyles.flexRow]}>
      <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>{props.children}</View>
    </View>
  );
};
