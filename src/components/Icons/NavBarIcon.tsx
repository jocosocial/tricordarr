import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppTheme} from '../../styles/Theme';
import {useStyles} from '../Context/Contexts/StyleContext';
import {StyleProp, TextStyle} from 'react-native';

interface NavBarIconProps {
  icon: string;
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}

export const NavBarIcon = ({icon, size, color, style}: NavBarIconProps) => {
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
