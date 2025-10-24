import {useField, useFormikContext} from 'formik';
import React from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import {HelperText, Menu, TextInput} from 'react-native-paper';

import {TextFieldProps} from '#src/Components/Forms/Fields/TextField';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useMenu} from '#src/Hooks/MenuHook';
import {useAppTheme} from '#src/Styles/Theme';

interface SuggestedTextFieldProps extends TextFieldProps {
  suggestions?: string[];
}

/**
 * This duplicates a lot of what is in TextField but without the duplicate wrappers
 * around value handling that were in conflict.
 *
 * Check out https://www.npmjs.com/package/@rnpp-packages/react-native-paper-formik
 * https://github.com/callstack/react-native-paper/issues/2305#issuecomment-778847694
 */
export const SuggestedTextField = ({
  name,
  mode = 'outlined',
  multiline,
  numberOfLines,
  secureTextEntry,
  label,
  left,
  right,
  viewStyle,
  inputMode,
  autoCapitalize,
  maxLength,
  suggestions = [],
  disabled,
}: SuggestedTextFieldProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {isSubmitting} = useFormikContext();
  const [field, meta, helpers] = useField<string>(name);
  const {modalVisible} = useModal();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    outline: {
      borderColor: meta.error ? theme.colors.error : theme.colors.onBackground,
    },
  });

  const onValueChange = async (newValue: string) => {
    closeMenu();
    await helpers.setValue(newValue);
  };

  const handleOpen = () => {
    console.log(`[SuggestedTextField.tex] triggering handleOpen, current value "${field.value}"`);
    if (field.value !== '' || modalVisible) {
      return;
    }
    openMenu();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      // onScroll is a patch I added
      // @ts-ignore
      onScroll={() => Keyboard.dismiss()}
      anchor={
        <View style={viewStyle}>
          <TextInput
            mode={mode}
            multiline={multiline}
            numberOfLines={numberOfLines}
            secureTextEntry={secureTextEntry}
            label={label}
            error={!!meta.error}
            left={left}
            right={right}
            inputMode={inputMode}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            onFocus={handleOpen}
            onChangeText={onValueChange}
            value={field.value}
            disabled={disabled || isSubmitting}
            onPress={handleOpen}
            outlineStyle={styles.outline}
          />
          <HelperText type={'error'} visible={!!meta.error && meta.touched}>
            {meta.error}
          </HelperText>
        </View>
      }>
      {suggestions.map((suggestion, index) => {
        return <Menu.Item key={index} title={suggestion} onPress={() => helpers.setValue(suggestion)} />;
      })}
    </Menu>
  );
};
