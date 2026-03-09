import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';

import {TextField} from '#src/Components/Forms/Fields/TextField';
import {isIOS} from '#src/Libraries/Platform/Detection';

interface UrlTextFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
  onChangeText?: (value: string) => void;
  viewStyle?: StyleProp<ViewStyle>;
}

// keyboardType='url' on Android sets InputType.TYPE_TEXT_VARIATION_URI without
// InputType.TYPE_CLASS_TEXT, which causes the cursor to be invisible on many devices.
// This is a known React Native bug (facebook/react-native#32782, #35651).
// textContentType is iOS-only and provides the cursor fix + autofill hints there.
export const UrlTextField = (props: UrlTextFieldProps) => {
  return (
    <TextField
      name={props.name}
      label={props.label}
      disabled={props.disabled}
      onChangeText={props.onChangeText}
      viewStyle={props.viewStyle}
      autoCapitalize={'none'}
      textContentType={'URL'}
      keyboardType={isIOS ? 'url' : 'default'}
    />
  );
};
