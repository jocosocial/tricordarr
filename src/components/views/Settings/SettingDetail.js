import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTheme, List, Divider, Text, TextInput} from 'react-native-paper';
import {Settings} from '../../../libraries/Settings';

export const SettingDetail = ({route, navigation}) => {
  const [value, setValue] = useState('default');
  const {settingKey} = route.params;
  const theme = useTheme();

  useEffect(() => {
    console.log('EFFECTING NAV')
    navigation.setOptions({title: settingKey})
  }, [route])

  useEffect(() => {
    console.log('EFFECTING VALUE')
    async function getValue() {
      setValue(await Settings.getSetting(settingKey));
    }
    getValue().catch(console.error)
  }, [value])

  // console.log("Setting!!!!", await Settings.getSetting('SERVER_URL'))

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          {/*<Text>This is where the setting {settingKey} goes</Text>*/}
          <TextInput label={'value'} value={value} onChangeText={text => setValue(text)}></TextInput>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
