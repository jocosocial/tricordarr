import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {useStyles} from '#src/Context/Contexts/StyleContext';

/**
 * A top level container for FlatList renderItem output. Similar in concept to a <List.Item>
 * but for things that do not qualify for that particular element.
 */
export const FlatListItemContent = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <View style={[commonStyles.flexRow]}>{children}</View>;
};
