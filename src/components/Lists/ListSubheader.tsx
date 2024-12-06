import React from 'react';
import {PropsWithChildren} from 'react';
import {List} from 'react-native-paper';
import {useStyles} from '../Context/Contexts/StyleContext';
import {StyleSheet} from 'react-native';

export const ListSubheader = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    subheader: {
      ...commonStyles.surfaceVariant,
    },
  });
  return <List.Subheader style={styles.subheader}>{children}</List.Subheader>;
};
