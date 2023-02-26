import React from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export const SettingListItem = ({setting, navComponent = 'SettingDetailScreen'}) => {
  const navigation = useNavigation();

  return (
    <List.Item
      title={setting.title}
      description={setting.description}
      onPress={() => navigation.push(navComponent, {settingKey: setting.key})}
    />
  );
};
