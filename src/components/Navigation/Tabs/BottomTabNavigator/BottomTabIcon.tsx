import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface NavBarIconProps {
  icon: string;
  color: any;
  size: number;
}

export const NavBarIcon = ({icon, color = undefined, size = 22}: NavBarIconProps) => {
  return <MaterialCommunityIcons name={icon} color={color} size={size} />;
};
