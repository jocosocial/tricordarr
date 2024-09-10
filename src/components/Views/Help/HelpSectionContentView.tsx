import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {View} from 'react-native';
import React, {PropsWithChildren} from 'react';

export const HelpSectionContentView = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <View style={commonStyles.flex}>{children}</View>;
};
