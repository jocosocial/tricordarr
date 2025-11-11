import {useField, useFormikContext} from 'formik';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Keyboard} from 'react-native';
import {HelperText, Menu, Text, TextInput} from 'react-native-paper';

import {TextFieldProps} from '#src/Components/Forms/Fields/TextField';
import {AppMenu} from '#src/Components/Menus/AppMenu';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
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
  right: _right,
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
  const theme = useAppTheme();
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    outline: {
      borderColor: meta.error ? theme.colors.error : theme.colors.onBackground,
    },
    headerContainer: {
      ...commonStyles.paddingVerticalSmall,
      ...commonStyles.onMenu,
      ...commonStyles.paddingHorizontalSmall,
    },
  });

  const onValueChange = async (newValue: string) => {
    closeMenu();
    await helpers.setValue(newValue);
  };

  const toggleMenu = () => {
    // Dismiss keyboard when toggling menu
    Keyboard.dismiss();
    if (visible) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const headerComponent = () => (
    <View style={styles.headerContainer}>
      <Text variant={'labelSmall'}>These are just suggestions. You can{'\n'}put anything you want.</Text>
    </View>
  );

  // Always show suggestions icon - TextInput.Icon must be direct child of TextInput
  // If right prop is provided, it will be overridden by the suggestions icon
  const suggestionsIcon = <TextInput.Icon icon={AppIcons.menu} onPress={toggleMenu} />;

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      onScroll={() => Keyboard.dismiss()}
      header={headerComponent}
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
            right={suggestionsIcon}
            inputMode={inputMode}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            onChangeText={onValueChange}
            value={field.value}
            disabled={disabled || isSubmitting}
            outlineStyle={styles.outline}
          />
          <HelperText type={'error'} visible={!!meta.error && meta.touched}>
            {meta.error}
          </HelperText>
        </View>
      }>
      {suggestions.map((suggestion, index) => {
        return <Menu.Item key={index} title={suggestion} onPress={() => onValueChange(suggestion)} />;
      })}
    </AppMenu>
  );
};
