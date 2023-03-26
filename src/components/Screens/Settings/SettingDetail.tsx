import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {AppSettings} from '../../../libraries/AppSettings';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {SettingForm} from '../../Forms/SettingForm';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SettingFormValues} from '../../../libraries/Types';

interface SettingDetailProps {
  route: any;
  navigation: any;
}

export const SettingDetail = ({route, navigation}: SettingDetailProps) => {
  const [value, setValue] = useState('');
  const {settingKey}: {settingKey: string} = route.params;
  const setting: AppSettings = AppSettings[settingKey as keyof typeof AppSettings];
  const {setErrorMessage} = useErrorHandler();

  useEffect(() => {
    navigation.setOptions({title: setting.title});

    async function getValue() {
      setValue((await setting.getValue()) ?? '');
    }

    getValue().catch(console.error);
  }, [navigation, route, setting, value]);

  async function onSave(values: SettingFormValues) {
    try {
      await setting.setValue(values.settingValue);
      navigation.goBack();
    } catch (e) {
      setErrorMessage(e);
    }
  }

  return (
    <AppView>
      <ScrollView>
        <ScrollingContentView>
          <PaddedContentView>
            <SettingForm value={value} onSave={onSave} />
          </PaddedContentView>
        </ScrollingContentView>
      </ScrollView>
    </AppView>
  );
};
