import React from 'react';
import {View} from 'react-native';
import {Formik} from 'formik';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {SettingFormValues} from '../../libraries/Types/FormValues';
import {TextField} from './Fields/TextField';
import {useStyles} from '../Context/Contexts/StyleContext';

interface SettingFormProps {
  value: string;
  onSave: (values: SettingFormValues) => void;
}

export const SettingForm = ({value, onSave}: SettingFormProps) => {
  const {commonStyles} = useStyles();
  const initialFormValues: SettingFormValues = {
    settingValue: value,
  };
  return (
    <Formik enableReinitialize initialValues={initialFormValues} onSubmit={onSave}>
      {({handleSubmit}) => (
        <View>
          <TextField name={'settingValue'} />
          <PrimaryActionButton onPress={handleSubmit} buttonText={'Save'} style={[commonStyles.marginTopSmall]} />
        </View>
      )}
    </Formik>
  );
};
