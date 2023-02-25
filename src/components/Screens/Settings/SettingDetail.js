import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTheme} from 'react-native-paper';
import {AppSettings} from '../../../libraries/AppSettings';
import {StringSettingForm} from '../../forms/StringSettingForm';
import {BooleanSettingForm} from '../../forms/BooleanSettingForm';
import {ErrorSnackbar} from "../../Snackbars/ErrorSnackbar";
import {AppView} from "../../Views/AppView";

export const SettingDetail = ({route, navigation}) => {
  const [value, setValue] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState('');
  const {settingKey} = route.params;
  const setting = AppSettings[settingKey];
  const theme = useTheme();

  useEffect(() => {
    navigation.setOptions({title: setting.title});
    async function getValue() {
      setValue(await setting.getValue());
    }
    getValue().catch(console.error);
  }, [navigation, route, setting]);

  async function onSave() {
    try {
      await setting.setValue(value);
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save:', e);
      setErrorMessage('GRRRR ARRRGHH');
    }
  }

  return (
    <AppView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          {setting.dataType === String && (
            <StringSettingForm value={value} setValue={setValue} onSave={onSave} />
          )}
          {setting.dataType === Boolean && (
            <BooleanSettingForm value={value} setValue={setValue} onSave={onSave} />
          )}
          {/*<TextInput label={'Value'} value={value} onChangeText={text => setValue(text)} />*/}
          {/*<SaveButton onPress={saveSetting} />*/}
          {errorMessage && errorMessage !== '' && <ErrorSnackbar message={errorMessage} />}
        </View>
      </ScrollView>
    </AppView>
  );
};
