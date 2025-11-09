import React from 'react';
import {StyleSheet, View} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

interface MenuScrollIndicatorProps {
  visible: boolean;
}

/**
 * A scroll indicator that appears at the bottom of scrollable menus
 * to hint to users that they can scroll down.
 */
export const MenuScrollIndicator = ({visible}: MenuScrollIndicatorProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    scrollIndicator: {
      ...commonStyles.paddingTopSmall,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.justifyContentCenter,
      ...commonStyles.onMenu,
    },
  });

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.scrollIndicator}>
      <AppIcon icon={AppIcons.scrollDown} small />
    </View>
  );
};

