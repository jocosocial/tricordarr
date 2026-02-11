import {Field, useField, useFormikContext} from 'formik';
import React, {ReactNode} from 'react';
import {
  FocusEvent,
  KeyboardTypeOptions,
  StyleProp,
  StyleSheet,
  TextInputSelectionChangeEvent,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {RNInputModeOptions} from '#src/Types';

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
  inputMode?: RNInputModeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  onFocus?: () => void;
  keyboardType?: KeyboardTypeOptions;
  onChangeText?: (value: string) => void;
  innerTextStyle?: StyleProp<TextStyle>;
  infoText?: string;
  onBlur?: (e?: FocusEvent) => void;
  disabled?: boolean;
  onSelectionChange?: (event: TextInputSelectionChangeEvent) => void;
  trimOnBlur?: boolean;
  textContentType?:
    | 'none'
    | 'URL'
    | 'addressCity'
    | 'addressCityAndState'
    | 'addressState'
    | 'countryName'
    | 'creditCardNumber'
    | 'emailAddress'
    | 'familyName'
    | 'fullStreetAddress'
    | 'givenName'
    | 'jobTitle'
    | 'location'
    | 'middleName'
    | 'name'
    | 'namePrefix'
    | 'nameSuffix'
    | 'nickname'
    | 'organizationName'
    | 'postalCode'
    | 'streetAddressLine1'
    | 'streetAddressLine2'
    | 'sublocality'
    | 'telephoneNumber'
    | 'username'
    | 'password'
    | 'newPassword'
    | 'oneTimeCode';
  autoComplete?:
    | 'birthdate-day'
    | 'birthdate-full'
    | 'birthdate-month'
    | 'birthdate-year'
    | 'cc-csc'
    | 'cc-exp'
    | 'cc-exp-day'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-number'
    | 'email'
    | 'gender'
    | 'name'
    | 'name-family'
    | 'name-given'
    | 'name-middle'
    | 'name-middle-initial'
    | 'name-prefix'
    | 'name-suffix'
    | 'password'
    | 'password-new'
    | 'postal-address'
    | 'postal-address-country'
    | 'postal-address-extended'
    | 'postal-address-extended-postal-code'
    | 'postal-address-locality'
    | 'postal-address-region'
    | 'postal-code'
    | 'street-address'
    | 'sms-otp'
    | 'tel'
    | 'tel-country-code'
    | 'tel-national'
    | 'tel-device'
    | 'username'
    | 'username-new'
    | 'off';
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
  onSelectionChange,
  trimOnBlur = true,
  textContentType,
  autoComplete,
}: TextFieldProps) => {
  const {handleChange, handleBlur, isSubmitting, setFieldValue, setFieldTouched} = useFormikContext();
  const {theme} = useAppTheme();
  const [field, meta] = useField<string>(name);
  const {styleDefaults} = useStyles();

  // Calculate minHeight based on numberOfLines
  const calculatedMinHeight = styleDefaults.fontSize * numberOfLines + styleDefaults.marginSize * 2;

  const styles = StyleSheet.create({
    outline: {
      borderColor: meta.error ? theme.colors.error : theme.colors.onBackground,
    },
    textInput: {
      minHeight: calculatedMinHeight,
    },
  });

  const handleValueChange = (value: string) => {
    handleChange(name)(value);
  };

  const handleBlurEvent = (event: FocusEvent) => {
    if (trimOnBlur && field.value && typeof field.value === 'string') {
      const trimmedValue = field.value.trim();
      if (trimmedValue !== field.value) {
        // Set the trimmed value first
        setFieldValue(name, trimmedValue, false);
        // Use requestAnimationFrame to ensure state update propagates before validation
        requestAnimationFrame(() => {
          // Mark as touched and trigger validation on the trimmed value
          setFieldTouched(name, true, true);
        });
        // Call user's onBlur callback
        if (onBlur) {
          onBlur(event);
        }
        // Don't call handleBlur here since we're handling it manually
        return;
      }
    }
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
            style={[styles.textInput, innerTextStyle]}
            onSelectionChange={onSelectionChange}
            outlineStyle={styles.outline}
            textContentType={textContentType}
            autoComplete={autoComplete}
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
