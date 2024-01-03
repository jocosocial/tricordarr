import React, {PropsWithChildren} from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {Text} from 'react-native-paper';

export const BoldText = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <Text style={[commonStyles.bold]}>{children}</Text>;
};
