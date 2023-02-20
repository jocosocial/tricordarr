import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTheme, List, Divider, Button, TextInput} from 'react-native-paper';
import {Settings} from '../../../libraries/Settings';

export const SettingDetail = ({route, navigation}) => {
  const [value, setValue] = useState('default');
  const {settingKey} = route.params;
  const theme = useTheme();

  useEffect(() => {
    console.log('EFFECTING NAV')
    navigation.setOptions({title: settingKey})
    async function getValue() {
      setValue(await Settings.getSetting(settingKey));
    }
    getValue().catch(console.error)
  }, [route])

  // console.log("Setting!!!!", await Settings.getSetting('SERVER_URL'))

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          {/*<Text>This is where the setting {settingKey} goes</Text>*/}
          <TextInput label={'Value'} value={value} onChangeText={text => setValue(text)}></TextInput>
          <Button buttonColor={theme.colors.twitarrPositiveButton} style={{margin: 20}} mode="contained">Save</Button>
          <Button buttonColor={theme.colors.twitarrNeutralButton} style={{margin: 20}} mode="contained">Cancel</Button>
          <Button buttonColor={theme.colors.twitarrNegativeButton} style={{margin: 20}} mode="contained">Reset</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
