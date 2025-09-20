import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface NavHeaderTitleProps {
  title: string;
  onPress: () => void;
}

export const NavHeaderTitle = ({title, onPress}: NavHeaderTitleProps) => {
  const {commonStyles} = useStyles();

  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={[commonStyles.navigationHeaderTitle]}>{title}</Text>
    </TouchableOpacity>
  );
};
