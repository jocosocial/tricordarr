import {useField, useFormikContext} from 'formik';
import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Button, HelperText} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useMenu} from '#src/Hooks/useMenu';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('PickerField.tsx');

interface PickerFieldProps<TData> {
  name: string;
  testID: string;
  label: string;
  value: TData | undefined;
  choices: TData[];
  getTitle: (value: TData | undefined) => string;
  viewStyle?: StyleProp<ViewStyle>;
  addUndefinedOption?: boolean;
  onSelect?: (value: TData | undefined) => void;
  anchorButtonMode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  helperText?: string;
  disabled?: boolean;
}

// https://www.freecodecamp.org/news/typescript-generics-with-functional-react-components/
export const PickerField = <TData,>({
  name,
  testID,
  label,
  value,
  choices,
  getTitle,
  viewStyle,
  addUndefinedOption = false,
  onSelect,
  anchorButtonMode = 'outlined',
  helperText,
  disabled,
}: PickerFieldProps<TData>) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {commonStyles, styleDefaults} = useStyles();
  const {theme} = useAppTheme();
  const {setFieldValue, isSubmitting} = useFormikContext();
  const [_, meta] = useField<TData>(name);
  const isFieldDisabled = disabled || isSubmitting;
  const textColor = meta.error
    ? theme.colors.error
    : isFieldDisabled
      ? theme.colors.onSurfaceDisabled
      : theme.colors.onBackground;

  const handleSelect = (newValue: TData | undefined) => {
    logger.debug('Selecting value', newValue);
    setFieldValue(name, newValue);
    closeMenu();
    if (onSelect) {
      onSelect(newValue);
    }
  };

  const styles = StyleSheet.create({
    button: {
      ...commonStyles.roundedBorder,
      ...commonStyles.flex,
      minHeight: 48,
      borderColor: meta.error ? theme.colors.error : theme.colors.onBackground,
    },
    text: {
      fontSize: styleDefaults.fontSize,
      fontWeight: 'normal',
      ...commonStyles.fontFamilyNormal,
      ...(anchorButtonMode === 'outlined' ? {marginHorizontal: 14} : commonStyles.marginHorizontalSmall),
      color: textColor,
    },
    content: {
      ...commonStyles.flexRow,
      ...commonStyles.flex,
      minHeight: 48,
      justifyContent: 'flex-start',
    },
    helperTextContainer: {
      ...commonStyles.paddingHorizontalSmall,
    },
    helperText: {
      color: theme.colors.onBackground,
    },
  });

  // AppMenu caps the height and scrolls (a raw Paper Menu clips long lists), opens with the
  // current value in view, and bridges portal contexts itself.
  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <View style={viewStyle}>
          <Button
            testID={testID}
            buttonColor={theme.colors.background}
            textColor={textColor}
            labelStyle={styles.text}
            contentStyle={styles.content}
            style={styles.button}
            onPress={openMenu}
            disabled={isFieldDisabled}
            mode={anchorButtonMode}>
            {label} ({getTitle(value)})
          </Button>
          {helperText && (
            <View style={styles.helperTextContainer}>
              <HelperText style={styles.helperText} type={'info'}>
                {helperText}
              </HelperText>
            </View>
          )}
          {meta.error && <HelperText type={'error'}>{meta.error}</HelperText>}
        </View>
      }>
      {choices.map((item, index) => (
        <SelectableMenuItem
          key={index}
          title={getTitle(item)}
          selected={item === value}
          onPress={() => handleSelect(item)}
        />
      ))}
      {addUndefinedOption && (
        <SelectableMenuItem title={'None'} selected={value === undefined} onPress={() => handleSelect(undefined)} />
      )}
    </AppMenu>
  );
};
