import React from 'react';
import {IconButton} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {AppIcons} from '#src/Enums/Icons';

interface FloatingScrollButtonProps {
  onPress: () => void;
  icon?: IconSource;
  small?: boolean;
  testID: string;
}

/**
 * A single discrete button to float above content and give the user something
 * to jump to the top/bottom. Composed within a FloatingScrollButtonsView,
 * which owns the floating positioning.
 */
export const FloatingScrollButton = ({
  onPress,
  icon = AppIcons.scrollDown,
  small = false,
  testID,
}: FloatingScrollButtonProps) => {
  return <IconButton testID={testID} icon={icon} size={small ? 15 : 30} onPress={onPress} mode={'contained-tonal'} />;
};
