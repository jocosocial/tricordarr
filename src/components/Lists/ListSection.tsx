import React from 'react';
import {PropsWithChildren} from 'react';
import {List} from 'react-native-paper';
import {commonStyles} from '#src/Styles';

/**
 * Wrapper for a <List.Section>. Exists because the default style has margin
 * that is undesirable for our purposes.
 */
export const ListSection = ({children}: PropsWithChildren) => {
  const style = {
    ...commonStyles.marginZero,
  };
  return <List.Section style={style}>{children}</List.Section>;
};
