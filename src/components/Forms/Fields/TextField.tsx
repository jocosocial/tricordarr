import React, {ReactNode} from 'react';
import {KeyboardTypeOptions, StyleProp, View, ViewStyle} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import {FastField, useField, useFormikContext} from 'formik';
import {InputModeOptions} from 'react-native/Libraries/Components/TextInput/TextInput';
import {useAppTheme} from '../../../styles/Theme';

export interface TextFieldProps {
  name: string;
  mode?: 'flat' | 'outlined' | undefined;
  multiline?: boolean;
  numberOfLines?: number;
  label?: string;
  left?: ReactNode;
  right?: ReactNode;
  secureTextEntry?: boolean;
  viewStyle?: StyleProp<ViewStyle>;
  inputMode?: InputModeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  onFocus?: () => void;
  keyboardType?: KeyboardTypeOptions;
  onChangeText?: (value: string) => void;
}

export const TextField = ({
  name,
  mode = 'outlined',
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  label,
  left,
  right,
  viewStyle,
  inputMode,
  autoCapitalize,
  maxLength,
  onFocus,
  keyboardType,
  onChangeText,
}: TextFieldProps) => {
  const {handleChange, handleBlur, isSubmitting, setFieldValue} = useFormikContext();
  const theme = useAppTheme();
  const [field, meta, helpers] = useField<string>(name);

  const handleValueChange = (value: string) => {
    if (keyboardType === 'numeric') {
      setFieldValue(name, parseInt(value, 10));
      return;
    }
    handleChange(name)(value);
  };

  return (
    <FastField name={name}>
      {() => (
        <View style={viewStyle}>
          <TextInput
            keyboardType={keyboardType}
            textColor={theme.colors.onBackground} // @TODO this isnt working
            label={label}
            mode={mode}
            multiline={multiline}
            onChangeText={onChangeText || handleValueChange}
            onBlur={handleBlur(name)}
            value={field.value.toString()}
            error={!!meta.error && meta.touched}
            numberOfLines={numberOfLines}
            disabled={isSubmitting}
            left={left}
            right={right}
            secureTextEntry={secureTextEntry}
            inputMode={inputMode}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            onFocus={onFocus}
          />
          <HelperText type={'error'} visible={!!meta.error && meta.touched}>
            {meta.error}
          </HelperText>
        </View>
      )}
    </FastField>
  );
};
