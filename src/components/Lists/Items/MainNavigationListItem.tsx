import {IconButton, List} from 'react-native-paper';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

interface MainNavigationListItemProps {
  icon: IconSource;
  onPress: () => void;
  title: string;
  description: string;
}

export const MainNavigationListItem = ({
  icon,
  onPress,
  title,
  description,
}: MainNavigationListItemProps) => {
  const {commonStyles} = useStyles();

  const getIcon = () => <IconButton icon={icon} />;

  return (
    <List.Item
      style={[commonStyles.paddingVerticalZero]}
      left={getIcon}
      onPress={onPress}
      title={title}
      description={description}
    />
  );
};
