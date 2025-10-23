import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import React from 'react';
import {StyleProp, TextStyle} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Styles/Theme';

interface AppIconProps {
  icon: string;
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  small?: boolean;
}

/**
 * An Icon based on Material UI.
 * https://pictogrammers.com/library/mdi/
 */
export const AppIcon = ({icon, size, color, style, onPress, onLongPress, small}: AppIconProps) => {
  const theme = useAppTheme();
  const {styleDefaults} = useStyles();

  return (
    <MaterialCommunityIcons
      onPress={onPress}
      style={style}
      name={icon}
      size={size || small ? styleDefaults.iconSizeSmall : styleDefaults.iconSize}
      color={color || theme.colors.onBackground}
      onLongPress={onLongPress}
    />
  );
};
