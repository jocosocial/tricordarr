import React from 'react';
import {List} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';

interface TextListItemProps {
  title: string;
  onPress: () => void;
}

export const TextListItem = ({title, onPress}: TextListItemProps) => {
  const {styleDefaults} = useStyles();

  // List.Item hardcodes View padding to 16, and there's no override. It expects you to
  // have a left={} or otherwise deal with the spacing.
  return <List.Item titleStyle={{paddingLeft: styleDefaults.marginSize - 16}} title={title} onPress={onPress} />;
};
