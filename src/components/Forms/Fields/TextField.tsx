import React from 'react';
import {View} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import {FastField, useFormikContext} from 'formik';

interface TextFieldProps {
  name: string;
  mode?: 'flat' | 'outlined' | undefined;
}

export const TextField = ({name, mode = 'outlined'}: TextFieldProps) => {
  const {handleChange, handleBlur, values, errors, touched} = useFormikContext();
  return (
    <FastField name={name}>
      {() => (
        <View>
          <TextInput
            mode={mode}
            onChangeText={handleChange(name)}
            onBlur={handleBlur(name)}
            value={values[name]}
            error={!!errors[name] && touched[name]}
          />
          <HelperText type={'error'} visible={!!errors[name] && touched[name]}>
            {errors[name]}
          </HelperText>
        </View>
      )}
    </FastField>
  );
};
