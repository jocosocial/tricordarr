import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTheme} from 'react-native-paper';
import {Settings} from '../../../libraries/Settings';
import {StringSettingForm} from '../../forms/StringSettingForm';

export const SettingDetail = ({route, navigation}) => {
  const [value, setValue] = useState(undefined);
  const {settingKey} = route.params;
  const setting = Settings[settingKey];
  const theme = useTheme();

  useEffect(() => {
    navigation.setOptions({title: setting.title});
    async function getValue() {
      setValue(await setting.getValue());
    }
    getValue().catch(console.error);
  }, [navigation, route, setting]);

  async function saveSetting() {
    try {
      await setting.setValue(value);
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save:', e);
    }
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          <StringSettingForm value={value} setValue={setValue} saveSetting={saveSetting} />
          {/*<TextInput label={'Value'} value={value} onChangeText={text => setValue(text)} />*/}
          {/*<SaveButton onPress={saveSetting} />*/}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
