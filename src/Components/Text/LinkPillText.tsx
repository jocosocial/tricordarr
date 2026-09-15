import React from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface LinkPillTextProps {
  icon: string;
  label: string;
}

export const LinkPillText = ({icon, label}: LinkPillTextProps) => {
  const {commonStyles, styleDefaults} = useStyles();

  const styles = StyleSheet.create({
    container: {
      ...commonStyles.hyperlinkTag,
      ...commonStyles.onHyperlinkTag,
    },
    label: {
      ...commonStyles.onHyperlinkTag,
      ...commonStyles.bold,
    },
  });

  // The "iconSizeSmall - 2" happens to deal with the centering problem.
  // https://github.com/react/react-native/issues/49144
  return (
    <Text style={styles.container}>
      <AppIcon icon={icon} size={styleDefaults.iconSizeSmall - 2} style={commonStyles.onHyperlinkTag} />{' '}
      <Text style={styles.label}>{label}</Text>
    </Text>
  );
};
