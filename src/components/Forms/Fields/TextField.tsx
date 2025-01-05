import React, {ReactNode} from 'react';
import {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  StyleProp,
  TextInputFocusEventData,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import {Field, useField, useFormikContext} from 'formik';
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
  innerTextStyle?: StyleProp<TextStyle>;
  infoText?: string;
  onBlur?: (e?: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  disabled?: boolean;
}

// @TODO make this type-generic
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
  innerTextStyle,
  infoText,
  onBlur,
  disabled,
}: TextFieldProps) => {
  const {handleChange, handleBlur, isSubmitting} = useFormikContext();
  const theme = useAppTheme();
  const [field, meta] = useField<string>(name);

  const handleValueChange = (value: string) => {
    handleChange(name)(value);
  };

  const handleBlurEvent = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (onBlur) {
      onBlur(event);
    }
    return handleBlur(name)(event);
  };

  // Went back to Field from FastField due to SuggestedTextField modal.
  // Hopefully that's not a bad thing.
  return (
    <Field name={name}>
      {() => (
        <View style={viewStyle}>
          <TextInput
            keyboardType={keyboardType}
            textColor={disabled || isSubmitting ? theme.colors.onSurfaceDisabled : theme.colors.onBackground} // @TODO this isnt working
            label={label}
            mode={mode}
            multiline={multiline}
            onChangeText={onChangeText || handleValueChange}
            onBlur={handleBlurEvent}
            value={field.value}
            error={!!meta.error}
            numberOfLines={numberOfLines}
            disabled={disabled || isSubmitting}
            left={left}
            right={right}
            secureTextEntry={secureTextEntry}
            inputMode={inputMode}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            onFocus={onFocus}
            style={innerTextStyle}
          />
          {infoText && <HelperText type={'info'}>{infoText}</HelperText>}
          <HelperText type={'error'} visible={!!meta.error && meta.touched}>
            {meta.error}
          </HelperText>
        </View>
      )}
    </Field>
  );
};
