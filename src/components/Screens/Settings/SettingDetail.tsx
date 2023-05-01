import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {AppSettings} from '../../../libraries/AppSettings';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {SettingForm} from '../../Forms/SettingForm';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SettingFormValues} from '../../../libraries/Types/FormValues';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {SettingsStackParamList} from '../../Navigation/Stacks/SettingsStack';

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.settingDetail,
  NavigatorIDs.settingsStack
>;

export const SettingDetail = ({route, navigation}: Props) => {
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
