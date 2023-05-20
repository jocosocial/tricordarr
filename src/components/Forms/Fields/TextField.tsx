import React, {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import {FastField, useFormikContext} from 'formik';

interface TextFieldProps {
  name: string;
  mode?: 'flat' | 'outlined' | undefined;
  multiline?: boolean;
  numberOfLines?: number;
  label?: string;
  left?: ReactNode;
  secureTextEntry?: boolean;
  viewStyle?: StyleProp<ViewStyle>;
}

export const TextField = ({
  name,
  mode = 'outlined',
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  label,
  left,
  viewStyle,
}: TextFieldProps) => {
  const {handleChange, handleBlur, values, errors, touched, isSubmitting} = useFormikContext();
  return (
    <FastField name={name}>
      {() => (
        <View style={viewStyle}>
          <TextInput
            label={label}
            mode={mode}
            multiline={multiline}
            onChangeText={handleChange(name)}
            onBlur={handleBlur(name)}
            value={values[name]}
            error={!!errors[name] && touched[name]}
            numberOfLines={numberOfLines}
            disabled={isSubmitting}
            left={left}
            secureTextEntry={secureTextEntry}
          />
          <HelperText type={'error'} visible={!!errors[name] && touched[name]}>
            {errors[name]}
          </HelperText>
        </View>
      )}
    </FastField>
  );
};
