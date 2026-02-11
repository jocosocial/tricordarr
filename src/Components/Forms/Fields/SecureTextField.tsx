import React from 'react';
import {TextInput} from 'react-native-paper';

import {TextField} from '#src/Components/Forms/Fields/TextField';
import {AppIcons} from '#src/Enums/Icons';

interface SecureTextFieldProps {
  name: string;
  label: string;
  textContentType?: 'password' | 'newPassword';
  autoComplete?: 'password' | 'password-new';
  showErrorWithoutTouch?: boolean;
}

export const SecureTextField = (props: SecureTextFieldProps) => {
  const [secure, setSecure] = React.useState(true);
  const onBlur = () => {
    setSecure(true);
  };
  return (
    <TextField
      name={props.name}
      label={props.label}
      left={<TextInput.Icon icon={AppIcons.password} />}
      right={<TextInput.Icon onPress={() => setSecure(!secure)} icon={secure ? AppIcons.show : AppIcons.hide} />}
      secureTextEntry={secure}
      onBlur={onBlur}
      textContentType={props.textContentType}
      autoComplete={props.autoComplete}
      showErrorWithoutTouch={props.showErrorWithoutTouch}
    />
  );
};
