import React, {PropsWithChildren} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {View} from 'react-native';

export const HelpSectionView = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <View style={commonStyles.flexRow}>{children}</View>;
};
