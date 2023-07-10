import React, {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import {FastField, useFormikContext} from 'formik';
import {InputModeOptions} from 'react-native/Libraries/Components/TextInput/TextInput';

interface TextFieldProps {
  name: string;
  mode?: 'flat' | 'outlined' | undefined;
  multiline?: boolean;
  numberOfLines?: number;
  label?: string;
  left?: ReactNode;
  secureTextEntry?: boolean;
  viewStyle?: StyleProp<ViewStyle>;
  inputMode?: InputModeOptions;
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
  inputMode,
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
            inputMode={inputMode}
          />
          <HelperText type={'error'} visible={!!errors[name] && touched[name]}>
            {errors[name]}
          </HelperText>
        </View>
      )}
    </FastField>
  );
};
