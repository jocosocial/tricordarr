import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

interface MenuScrollIndicatorProps {
  visible: boolean;
  onPress?: () => void;
  direction?: 'up' | 'down';
}

/**
 * A scroll indicator that appears at the top or bottom of scrollable menus
 * to hint to users that they can scroll further. When onPress is provided,
 * pressing it scrolls the menu to that end.
 */
export const MenuScrollIndicator = ({visible, onPress, direction = 'down'}: MenuScrollIndicatorProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    scrollIndicator: {
      position: 'absolute',
      ...(direction === 'down' ? {bottom: 0} : {top: 0}),
      left: 0,
      right: 0,
      ...commonStyles.paddingTopSmall,
      ...commonStyles.paddingBottomSmall,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.justifyCenter,
      ...commonStyles.onMenu,
    },
  });

  if (!visible) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.scrollIndicator} onPress={onPress}>
      <AppIcon icon={direction === 'down' ? AppIcons.scrollDown : AppIcons.scrollUp} small />
    </TouchableOpacity>
  );
};
