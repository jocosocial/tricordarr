import {TextInput} from 'react-native-paper';
import {SaveButton} from '../Buttons/SaveButton';
import React from 'react';

// @TODO make this do things with Formik.
export const StringSettingForm = ({value, setValue, saveSetting}) => {
  return (
    <>
      <TextInput label={'Value'} value={value} onChangeText={text => setValue(text)} />
      <SaveButton onPress={saveSetting} />
    </>
  );
};
