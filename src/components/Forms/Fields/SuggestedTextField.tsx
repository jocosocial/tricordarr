import {HelperText, Menu, TextInput} from 'react-native-paper';
import React from 'react';
import {TextFieldProps} from './TextField';
import {useField, useFormikContext} from 'formik';
import {useModal} from '../../Context/Contexts/ModalContext';
import {View} from 'react-native';

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
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const {isSubmitting} = useFormikContext();
  const [field, meta, helpers] = useField<string>(name);
  const {modalVisible} = useModal();

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
