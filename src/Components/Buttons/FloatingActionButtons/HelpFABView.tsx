import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {HelpFAB} from '#src/Components/Buttons/FloatingActionButtons/HelpFAB';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface HelpFABViewProps {
  icon: IconSource;
  label?: string;
}

export const HelpFABView = ({icon, label}: HelpFABViewProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    container: {
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.paddingBottomSmall,
    },
  });

  return (
    <View style={styles.container}>
      <HelpFAB icon={icon} label={label} />
    </View>
  );
};
