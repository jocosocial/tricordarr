import React from 'react';
import {List} from 'react-native-paper';
import {AppSettings} from '../../../libraries/AppSettings';
import {SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useSettingsStack} from '../../Navigation/Stacks/SettingsStack';

interface SettingListItemProps {
  setting: AppSettings;
  navComponent?: SettingsStackScreenComponents;
}

export const SettingListItem = ({
  setting,
  navComponent = SettingsStackScreenComponents.settingDetail,
}: SettingListItemProps) => {
  // https://github.com/react-navigation/react-navigation/issues/9037
  const navigation = useSettingsStack();

  return (
    <List.Item
      title={setting.title}
      description={setting.description}
      onPress={() => navigation.push(navComponent, {settingKey: setting.key})}
    />
  );
};
