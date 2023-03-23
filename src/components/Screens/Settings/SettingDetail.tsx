import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {AppSettings} from '../../../libraries/AppSettings';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {SettingForm} from '../../Forms/SettingForm';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';

interface SettingDetailProps {
  route: any;
  navigation: any;
}

export const SettingDetail = ({route, navigation}: SettingDetailProps) => {
  const [value, setValue] = useState('');
  const {settingKey} = route.params;
  const setting = AppSettings[settingKey];
  const {setErrorMessage} = useErrorHandler();

  useEffect(() => {
    navigation.setOptions({title: setting.title});

    async function getValue() {
      setValue(await setting.getValue());
    }

    getValue().catch(console.error);
  }, [navigation, route, setting, value]);

  async function onSave(values) {
    try {
      await setting.setValue(values.settingValue);
      navigation.goBack();
    } catch (e) {
      setErrorMessage(e.toString());
    }
  }

  return (
    <AppView>
      <ScrollView>
        <ScrollingContentView>
          <PaddedContentView>
            <SettingForm value={value} onSave={onSave}/>
          </PaddedContentView>
        </ScrollingContentView>
      </ScrollView>
    </AppView>
  );
};
