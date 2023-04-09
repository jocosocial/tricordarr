import React from 'react';
import {GestureResponderEvent} from 'react-native';
import {IconButton} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

interface NavBarIconButtonProps {
  icon: IconSource;
  size?: number;
  onPress: ((event: GestureResponderEvent) => void) | undefined;
}

export const NavBarIconButton = ({icon, size, onPress}: NavBarIconButtonProps) => {
  return <IconButton style={{margin: 0}} icon={icon} size={size} onPress={onPress} />;
};
