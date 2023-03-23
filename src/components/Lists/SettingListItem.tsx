import React from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {AppSettings} from '../../libraries/AppSettings';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface SettingListItemProps {
  setting: AppSettings;
  navComponent: string;
}

export const SettingListItem = ({setting, navComponent = 'SettingDetailScreen'}: SettingListItemProps) => {
  // https://github.com/react-navigation/react-navigation/issues/9037
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <List.Item
      title={setting.title}
      description={setting.description}
      onPress={() => navigation.push(navComponent, {settingKey: setting.key})}
    />
  );
};
