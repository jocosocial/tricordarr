import React, {PropsWithChildren} from 'react';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

export const ItalicText = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <Text style={[commonStyles.italics]}>{children}</Text>;
};
