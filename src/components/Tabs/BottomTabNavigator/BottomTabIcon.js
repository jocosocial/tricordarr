import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const NavBarIcon = ({icon, color = undefined, size = 22}) => {
  return <MaterialCommunityIcons name={icon} color={color} size={size} />;
};
