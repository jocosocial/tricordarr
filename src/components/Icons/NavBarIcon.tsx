import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {styleDefaults} from '../../styles';
import {useAppTheme} from '../../styles/Theme';

interface NavBarIconProps {
  icon: string;
  color?: string;
  size?: number;
}

export const NavBarIcon = ({icon, size = styleDefaults.iconSize, color}: NavBarIconProps) => {
  const theme = useAppTheme();

  if (!color) {
    color = theme.colors.onBackground;
  }

  return <MaterialCommunityIcons name={icon} size={size} color={color} />;
};
