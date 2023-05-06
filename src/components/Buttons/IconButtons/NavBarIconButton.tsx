import React from 'react';
import {GestureResponderEvent} from 'react-native';
import {IconButton} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {useStyles} from '../../Context/Contexts/StyleContext';

interface NavBarIconButtonProps {
  icon: IconSource;
  size?: number;
  onPress: ((event: GestureResponderEvent) => void) | undefined;
}

export const NavBarIconButton = ({icon, size, onPress}: NavBarIconButtonProps) => {
  const {commonStyles} = useStyles();
  const style = {
    ...commonStyles.marginZero,
    ...commonStyles.background,
  };
  return <IconButton style={style} icon={icon} size={size} onPress={onPress} />;
};
