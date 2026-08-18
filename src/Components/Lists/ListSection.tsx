import React, {PropsWithChildren} from 'react';
import {List} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

/**
 * Wrapper for a <List.Section>. Exists because the default style has margin
 * that is undesirable for our purposes.
 */
export const ListSection = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <List.Section style={commonStyles.marginZero}>{children}</List.Section>;
};
