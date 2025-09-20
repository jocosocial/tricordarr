import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import {TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import React from 'react';

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
