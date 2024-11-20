import React, {PropsWithChildren} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {View} from 'react-native';

export const FlexCenteredContentView = (props: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return (
    <View style={[commonStyles.flexRow]}>
      <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>{props.children}</View>
    </View>
  );
};
