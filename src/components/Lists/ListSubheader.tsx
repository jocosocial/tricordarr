import React from 'react';
import {PropsWithChildren} from 'react';
import {List} from 'react-native-paper';
import {useStyles} from '../Context/Contexts/StyleContext';

export const ListSubheader = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <List.Subheader style={commonStyles.surfaceVariant}>{children}</List.Subheader>;
};
