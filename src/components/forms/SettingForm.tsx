import React from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {Formik} from 'formik';
import {SaveButton} from '../Buttons/SaveButton';

interface SettingFormProps {
  value: string;
  onSave: () => void | Promise<any>;
}

export const SettingForm = ({value, onSave}: SettingFormProps) => {
  return (
    <Formik enableReinitialize initialValues={{settingValue: value}} onSubmit={onSave}>
      {({handleChange, handleBlur, handleSubmit, values}) => (
        <View>
          <TextInput
            label={'Value'}
            onChangeText={handleChange('settingValue')}
            onBlur={handleBlur('settingValue')}
            value={values.settingValue}
          />
          <SaveButton onPress={handleSubmit} buttonText={'Save'} />
        </View>
      )}
    </Formik>
  );
};
