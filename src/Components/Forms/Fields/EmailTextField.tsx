import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';

import {TextField} from '#src/Components/Forms/Fields/TextField';
import {isIOS} from '#src/Libraries/Platform/Detection';

interface EmailTextFieldProps {
  name: string;
  label: string;
  viewStyle?: StyleProp<ViewStyle>;
}

// keyboardType='email-address' on Android sets InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
// without InputType.TYPE_CLASS_TEXT, which causes the cursor to be invisible on many devices.
// Same upstream React Native bug as keyboardType='url' (facebook/react-native#32782).
// textContentType is iOS-only; autoComplete is the Android equivalent for autofill hints.
export const EmailTextField = (props: EmailTextFieldProps) => {
  return (
    <TextField
      name={props.name}
      label={props.label}
      viewStyle={props.viewStyle}
      autoCapitalize={'none'}
      textContentType={'emailAddress'}
      autoComplete={'email'}
      keyboardType={isIOS ? 'email-address' : 'default'}
    />
  );
};
