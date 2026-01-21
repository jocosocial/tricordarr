import React from 'react';
import {StyleSheet} from 'react-native';
import {FAB} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface HelpFABProps {
  icon: IconSource;
  label?: string;
}

export const HelpFAB = ({icon, label}: HelpFABProps) => {
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    fab: {
      backgroundColor: theme.colors.inverseSurface,
      ...commonStyles.flexStart,
    },
  });

  return <FAB visible={true} icon={icon} color={theme.colors.inverseOnSurface} style={styles.fab} label={label} />;
};
