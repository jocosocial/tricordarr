import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import {InputModeOptions} from 'react-native/Libraries/Components/TextInput/TextInput';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SettingFormValues} from '#src/Types/FormValues';

interface SettingFormProps {
  value: string;
  onSave: (values: SettingFormValues, formikHelpers: FormikHelpers<SettingFormValues>) => void;
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
      {({values, handleSubmit}) => (
        <View>
          <TextField name={'settingValue'} inputMode={inputMode} />
          <PrimaryActionButton
            onPress={handleSubmit}
            buttonText={'Save'}
            style={[commonStyles.marginTopSmall]}
            disabled={values.settingValue === initialFormValues.settingValue}
          />
        </View>
      )}
    </Formik>
  );
};
