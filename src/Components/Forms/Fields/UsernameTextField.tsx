import React, {ReactNode} from 'react';
import {StyleProp, ViewStyle} from 'react-native';

import {TextField, TextFieldProps} from '#src/Components/Forms/Fields/TextField';

interface UsernameTextFieldProps {
  name: string;
  testID: string;
  label: string;
  viewStyle?: StyleProp<ViewStyle>;
  left?: ReactNode;
  textContentType?: TextFieldProps['textContentType'];
  autoComplete?: TextFieldProps['autoComplete'];
  showErrorWithoutTouch?: boolean;
}

/**
 * Identifier field for Twitarr/Discord/Sched usernames.
 * Disables capitalization, autocorrect, and spell check so the OS does not
 * rewrite handles (https://github.com/jocosocial/tricordarr/issues/497).
 */
export const UsernameTextField = (props: UsernameTextFieldProps) => {
  return (
    <TextField
      name={props.name}
      testID={props.testID}
      label={props.label}
      viewStyle={props.viewStyle}
      left={props.left}
      autoCapitalize={'none'}
      autoCorrect={false}
      spellCheck={false}
      // Default to none so iOS does not treat untitled username fields as a person's name.
      textContentType={props.textContentType ?? 'none'}
      autoComplete={props.autoComplete ?? 'off'}
      showErrorWithoutTouch={props.showErrorWithoutTouch}
    />
  );
};
