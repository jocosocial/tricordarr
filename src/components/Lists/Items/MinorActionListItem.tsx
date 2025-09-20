import {List} from 'react-native-paper';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import React from 'react';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface MinorActionListItemProps {
  title: string;
  icon: string;
  onPress: () => void;
  description?: string;
}

export const MinorActionListItem = ({title, icon, onPress, description}: MinorActionListItemProps) => {
  const {commonStyles} = useStyles();

  const getIcon = () => <AppIcon style={[commonStyles.marginLeft]} icon={icon} />;

  return <List.Item title={title} left={getIcon} onPress={onPress} description={description} />;
};
