import React, {PropsWithChildren} from 'react';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

export const BoldText = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <Text style={[commonStyles.bold]}>{children}</Text>;
};
