import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {TextInput} from 'react-native-paper';

import {TextField} from '#src/Components/Forms/Fields/TextField';
import {AppIcons} from '#src/Enums/Icons';

interface UsernameTextFieldProps {
  testID: string;
  name?: string;
  label?: string;
  viewStyle?: StyleProp<ViewStyle>;
  showErrorWithoutTouch?: boolean;
}

/**
 * Identifier field for Twitarr/Discord/Sched usernames.
 * Disables capitalization, autocorrect, and spell check so the OS does not
 * rewrite handles (https://github.com/jocosocial/tricordarr/issues/497).
 */
export const UsernameTextField = ({
  testID,
  name = 'username',
  label = 'Username',
  viewStyle,
  showErrorWithoutTouch,
}: UsernameTextFieldProps) => {
  return (
    <TextField
      name={name}
      testID={testID}
      label={label}
      viewStyle={viewStyle}
      left={<TextInput.Icon icon={AppIcons.user} />}
      autoCapitalize={'none'}
      autoCorrect={false}
      spellCheck={false}
      textContentType={'username'}
      autoComplete={'username'}
      showErrorWithoutTouch={showErrorWithoutTouch}
    />
  );
};
