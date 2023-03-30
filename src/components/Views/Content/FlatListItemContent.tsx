import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const FlatListItemContent = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <View style={[commonStyles.flexRow]}>{children}</View>;
};
