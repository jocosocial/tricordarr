import React from 'react';
import {View} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {ListItem} from '#src/Components/Lists/ListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface MinorActionListItemProps {
  title: string;
  icon: string;
  onPress: () => void;
  description?: string;
}

export const MinorActionListItem = ({title, icon, onPress, description}: MinorActionListItemProps) => {
  const {commonStyles} = useStyles();

  const getIcon = () => (
    <View style={commonStyles.paddingLeftSmall}>
      <AppIcon icon={icon} />
    </View>
  );

  return <ListItem title={title} left={getIcon} onPress={onPress} description={description} />;
};
