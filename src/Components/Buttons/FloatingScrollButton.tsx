import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {FloatingScrollButtonHorizontalPosition, FloatingScrollButtonVerticalPosition} from '#src/Types';

interface FloatingScrollButtonProps {
  onPress: () => void;
  icon?: IconSource;
  // Raised means there is a ContentPostView or something like that.
  verticalPosition?: FloatingScrollButtonVerticalPosition;
  horizontalPosition?: FloatingScrollButtonHorizontalPosition;
  small?: boolean;
}

/**
 * Button to float above content and give the user something to jump to the top/bottom.
 */
export const FloatingScrollButton = ({
  onPress,
  icon = AppIcons.scrollDown,
  verticalPosition = 'bottom',
  horizontalPosition = 'left',
  small = false,
}: FloatingScrollButtonProps) => {
  const {commonStyles, styleDefaults} = useStyles();

  const styles = StyleSheet.create({
    container: {
      ...commonStyles.flexRow,
      // These made it centered.
      // ...commonStyles.fullWidth,
      // ...commonStyles.justifyCenter,
      ...commonStyles.backgroundTransparent,
      ...commonStyles.positionAbsolute,
      // Vertical positioning.
      ...(verticalPosition === 'bottom' ? {bottom: styleDefaults.marginSize * 1} : undefined),
      ...(verticalPosition === 'raised' ? {bottom: styleDefaults.marginSize * 4} : undefined),
      // Horizontal positioning.
      ...(horizontalPosition === 'left' ? {left: styleDefaults.marginSize / 2} : undefined),
      ...(horizontalPosition === 'right' ? {right: styleDefaults.marginSize / 2} : undefined),

    },
  });

  return (
    <View style={styles.container} pointerEvents={'box-none'}>
      <IconButton icon={icon} size={small ? 15 : 30} onPress={onPress} mode={'contained-tonal'} />
    </View>
  );
};
