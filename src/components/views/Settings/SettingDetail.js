import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTheme} from 'react-native-paper';
import {Settings} from '../../../libraries/Settings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SettingForm} from '../../forms/SettingForm';

export const SettingDetail = ({route, navigation}) => {
  const [value, setValue] = useState(undefined);
  const {settingKey} = route.params;
  const theme = useTheme();

  useEffect(() => {
    navigation.setOptions({title: settingKey});
    async function getValue() {
      setValue(await Settings.getSetting(settingKey));
    }
    getValue().catch(console.error);
  }, [navigation, route, settingKey]);

  async function saveSetting() {
    console.log('SAVING SETTING', value);
    try {
      await AsyncStorage.setItem(settingKey, value);
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save:', e);
    }
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          <SettingForm value={value} setValue={setValue} saveSetting={saveSetting} />
          {/*<TextInput label={'Value'} value={value} onChangeText={text => setValue(text)} />*/}
          {/*<SaveButton onPress={saveSetting} />*/}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
