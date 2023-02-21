import React from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export const SettingListItem = ({setting}) => {
  const navigation = useNavigation();

  return (
    <List.Item
      title={setting.title}
      description={setting.description}
      onPress={() => navigation.push('SettingDetail', {settingKey: setting.key})}
    />
  );
};
