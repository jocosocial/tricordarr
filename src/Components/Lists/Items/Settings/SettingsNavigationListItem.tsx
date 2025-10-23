import React from 'react';
import {List} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SettingsStackParamList, useSettingsStack} from '#src/Navigation/Stacks/SettingsStackNavigator';

interface NavigationListItemProps {
  title: string;
  description: string;
  navComponent: keyof SettingsStackParamList;
}

export const SettingsNavigationListItem = ({title, description, navComponent}: NavigationListItemProps) => {
  const navigation = useSettingsStack();
  const {commonStyles} = useStyles();

  return (
    <List.Item
      contentStyle={commonStyles.paddingLeftSmall}
      style={commonStyles.paddingRightSmall}
      title={title}
      description={description}
      onPress={() => navigation.push(navComponent)}
    />
  );
};
