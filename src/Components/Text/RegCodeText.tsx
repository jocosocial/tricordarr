import React from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {formatRegCodeDisplay} from '#src/Libraries/StringUtils';

interface RegCodeTextProps {
  code: string;
  selectable?: boolean;
}

/**
 * Client equivalent of Swiftarr's `#regCode` leaf tag: bold monospace THO-style display
 * (`abcabc` → `ABC ABC`).
 */
export const RegCodeText = ({code, selectable = true}: RegCodeTextProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    text: {
      ...commonStyles.bold,
      ...commonStyles.monospace,
    },
  });

  return (
    <Text selectable={selectable} style={styles.text}>
      {formatRegCodeDisplay(code)}
    </Text>
  );
};
