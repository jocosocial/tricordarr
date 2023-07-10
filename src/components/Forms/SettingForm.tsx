import React from 'react';
import {View} from 'react-native';
import {Formik} from 'formik';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {SettingFormValues} from '../../libraries/Types/FormValues';
import {TextField} from './Fields/TextField';
import {useStyles} from '../Context/Contexts/StyleContext';
import {InputModeOptions} from 'react-native/Libraries/Components/TextInput/TextInput';

interface SettingFormProps {
  value: string;
  onSave: (values: SettingFormValues) => void;
  validationSchema?: Object;
  inputMode?: InputModeOptions;
}

export const SettingForm = ({value, onSave, validationSchema, inputMode}: SettingFormProps) => {
  const {commonStyles} = useStyles();
  const initialFormValues: SettingFormValues = {
    settingValue: value,
  };
  return (
    <Formik enableReinitialize initialValues={initialFormValues} onSubmit={onSave} validationSchema={validationSchema}>
      {({handleSubmit}) => (
        <View>
          <TextField name={'settingValue'} inputMode={inputMode} />
          <PrimaryActionButton onPress={handleSubmit} buttonText={'Save'} style={[commonStyles.marginTopSmall]} />
        </View>
      )}
    </Formik>
  );
};
