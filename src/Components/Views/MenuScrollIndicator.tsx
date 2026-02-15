import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

interface MenuScrollIndicatorProps {
  visible: boolean;
  onPress?: () => void;
}

/**
 * A scroll indicator that appears at the bottom of scrollable menus
 * to hint to users that they can scroll down. When onPress is provided,
 * pressing it scrolls the menu to the bottom.
 */
export const MenuScrollIndicator = ({visible, onPress}: MenuScrollIndicatorProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    scrollIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      ...commonStyles.paddingTopSmall,
      ...commonStyles.paddingBottomSmall,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.justifyContentCenter,
      ...commonStyles.onMenu,
    },
  });

  if (!visible) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.scrollIndicator} onPress={onPress}>
      <AppIcon icon={AppIcons.scrollDown} small />
    </TouchableOpacity>
  );
};
