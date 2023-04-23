import React from 'react';
import {StyleProp, TextStyle} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppTheme} from '../../styles/Theme';
import {useStyles} from '../Context/Contexts/StyleContext';

interface AppIconProps {
  icon: string;
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}

export const AppIcon = ({icon, size, color, style}: AppIconProps) => {
  const theme = useAppTheme();
  const {styleDefaults} = useStyles();

  return (
    <MaterialCommunityIcons
      style={style}
      name={icon}
      size={size || styleDefaults.iconSize}
      color={color || theme.colors.onBackground}
    />
  );
};
