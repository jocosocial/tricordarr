import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {AppSettings} from '../../../libraries/AppSettings';
import {AppView} from '../../Views/AppView';
import {AppContainerView} from '../../Views/AppContainerView';
import {SettingForm} from '../../Forms/SettingForm';

export const SettingDetail = ({route, navigation}) => {
  const [value, setValue] = useState('');
  const {settingKey} = route.params;
  const setting = AppSettings[settingKey];

  useEffect(() => {
    navigation.setOptions({title: setting.title});
    async function getValue() {
      setValue(await setting.getValue());
    }
    getValue().catch(console.error);
  }, [navigation, route, setting, value]);

  async function onSave() {
    try {
      await setting.setValue(value);
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save:', e);
    }
  }

  return (
    <AppView>
      <ScrollView>
        <AppContainerView>
          <SettingForm value={value} onSave={onSave} />
        </AppContainerView>
      </ScrollView>
    </AppView>
  );
};
