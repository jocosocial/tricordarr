import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

/**
 * Empty state for the LFG list in pre-registration mode, explaining why only the user's own LFGs
 * can appear there.
 */
export const LfgPreRegistrationEmptyView = () => {
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          ...commonStyles.paddingVertical,
          ...commonStyles.paddingHorizontal,
        },
        text: {
          textAlign: 'center',
          color: theme.colors.onSurfaceVariant,
        },
      }),
    [theme, commonStyles],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>No LFGs to display.</Text>
      <Text style={styles.text}>
        During pre-registration you only see the LFGs you've created. Use the New LFG button to create one. You'll be
        able to find and join other LFGs once on board.
      </Text>
    </View>
  );
};
