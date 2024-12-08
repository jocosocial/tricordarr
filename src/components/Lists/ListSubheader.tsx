import React from 'react';
import {PropsWithChildren} from 'react';
import {List} from 'react-native-paper';
import {useStyles} from '../Context/Contexts/StyleContext';
import {StyleProp, StyleSheet, TextStyle} from 'react-native';

interface ListSubheaderProps extends PropsWithChildren {
  style?: StyleProp<TextStyle>;
}

export const ListSubheader = ({children, style}: ListSubheaderProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    subheader: {
      ...commonStyles.surfaceVariant,
      ...(style as TextStyle),
    },
  });
  return <List.Subheader style={styles.subheader}>{children}</List.Subheader>;
};
