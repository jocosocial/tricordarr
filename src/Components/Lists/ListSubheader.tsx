import React, {PropsWithChildren} from 'react';
import {StyleProp, StyleSheet, TextStyle} from 'react-native';
import {List} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface ListSubheaderProps extends PropsWithChildren {
  style?: StyleProp<TextStyle>;
}

export const ListSubheader = ({children, style}: ListSubheaderProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    subheader: {
      ...commonStyles.surfaceVariant,
      ...commonStyles.paddingHorizontalSmall,
      ...(style as TextStyle),
    },
  });
  return <List.Subheader style={styles.subheader}>{children}</List.Subheader>;
};
