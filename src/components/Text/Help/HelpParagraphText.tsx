import {Text} from 'react-native-paper';
import React, {PropsWithChildren} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

export const HelpParagraphText = (props: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <Text style={[commonStyles.marginBottomSmall]}>{props.children}</Text>;
};
