import React from 'react';
import {View} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import {FastField, useFormikContext} from 'formik';

interface TextFieldProps {
  name: string;
  mode?: 'flat' | 'outlined' | undefined;
  multiline?: boolean;
  numberOfLines?: number;
}

export const TextField = ({name, mode = 'outlined', multiline = false, numberOfLines = 1}: TextFieldProps) => {
  const {handleChange, handleBlur, values, errors, touched, isSubmitting} = useFormikContext();
  return (
    <FastField name={name}>
      {() => (
        <View>
          <TextInput
            mode={mode}
            multiline={multiline}
            onChangeText={handleChange(name)}
            onBlur={handleBlur(name)}
            value={values[name]}
            error={!!errors[name] && touched[name]}
            numberOfLines={numberOfLines}
            disabled={isSubmitting}
          />
          <HelperText type={'error'} visible={!!errors[name] && touched[name]}>
            {errors[name]}
          </HelperText>
        </View>
      )}
    </FastField>
  );
};
