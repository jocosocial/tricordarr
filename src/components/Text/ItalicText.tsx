import React, {PropsWithChildren} from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import {Text} from 'react-native-paper';

export const ItalicText = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <Text style={[commonStyles.italics]}>{children}</Text>;
};
