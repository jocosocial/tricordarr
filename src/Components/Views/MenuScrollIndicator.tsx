import React, {useMemo} from 'react';
import {StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

interface MenuScrollIndicatorProps {
  visible: boolean;
  onPress?: () => void;
  direction?: 'up' | 'down';
  /**
   * Background for the indicator strip, which sits on top of the content it is indicating and
   * so must match that surface. Defaults to the menu surface; pass the container's own
   * background when using this outside a menu.
   */
  backgroundStyle?: ViewStyle;
}

/**
 * A scroll indicator that appears at the top or bottom of scrollable menus
 * to hint to users that they can scroll further. When onPress is provided,
 * pressing it scrolls the menu to that end.
 */
export const MenuScrollIndicator = ({
  visible,
  onPress,
  direction = 'down',
  backgroundStyle,
}: MenuScrollIndicatorProps) => {
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scrollIndicator: {
          position: 'absolute',
          ...(direction === 'down' ? {bottom: 0} : {top: 0}),
          left: 0,
          right: 0,
          ...commonStyles.paddingTopSmall,
          ...commonStyles.paddingBottomSmall,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.justifyCenter,
          ...(backgroundStyle ?? commonStyles.onMenu),
        },
      }),
    [commonStyles, direction, backgroundStyle],
  );

  if (!visible) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.scrollIndicator} onPress={onPress}>
      <AppIcon icon={direction === 'down' ? AppIcons.scrollDown : AppIcons.scrollUp} small />
    </TouchableOpacity>
  );
};
