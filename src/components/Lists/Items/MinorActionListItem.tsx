import {List} from 'react-native-paper';
import {AppIcon} from '../../Icons/AppIcon';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';

interface MinorActionListItem {
  title: string;
  icon: string;
  onPress: () => void;
}

export const MinorActionListItem = ({title, icon, onPress}: MinorActionListItem) => {
  const {commonStyles} = useStyles();

  const getIcon = () => <AppIcon style={[commonStyles.marginLeft]} icon={icon} />;

  return <List.Item title={title} left={getIcon} onPress={onPress} />;
};
