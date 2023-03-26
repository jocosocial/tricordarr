import React from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {Formik} from 'formik';
import {SaveButton} from '../Buttons/SaveButton';
import {SettingFormValues} from '../../libraries/Types/FormValues';

interface SettingFormProps {
  value: string;
  onSave: any | Promise<any>;
}

export const SettingForm = ({value, onSave}: SettingFormProps) => {
  const initialFormValues: SettingFormValues = {
    settingValue: value,
  };
  return (
    <Formik enableReinitialize initialValues={initialFormValues} onSubmit={onSave}>
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
