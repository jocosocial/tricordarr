import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface NavHeaderTitleProps {
  title: string;
  /** Omit to render a plain, non-pressable title. */
  onPress?: () => void;
}

/**
 * Navigation header title that can optionally be pressed.
 */
export const NavHeaderTitle = ({title, onPress}: NavHeaderTitleProps) => {
  const {commonStyles} = useStyles();

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Text style={commonStyles.navigationHeaderTitle}>{title}</Text>
    </TouchableOpacity>
  );
};
