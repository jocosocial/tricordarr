import {Text} from 'react-native-paper';
import React, {PropsWithChildren} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

export const HelpHeaderText = (props: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return (
    <Text variant={'titleMedium'} style={[commonStyles.bold]}>
      {props.children}
    </Text>
  );
};
