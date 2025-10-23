import {useField, useFormikContext} from 'formik';
import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Button, Divider, HelperText, Menu} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useMenu} from '#src/Hooks/MenuHook';
import {useAppTheme} from '#src/Styles/Theme';

interface PickerFieldProps<TData> {
  name: string;
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
  const theme = useAppTheme();
  const {setFieldValue, isSubmitting} = useFormikContext();
  const [_, meta] = useField<TData>(name);

  const handleSelect = (newValue: TData | undefined) => {
    console.log(`[PickerField.tsx] selecting ${newValue}`);
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
      ...(anchorButtonMode === 'outlined' ? {marginHorizontal: 14} : undefined),
      color: meta.error ? theme.colors.error : theme.colors.onBackground,
    },
    content: {
      ...commonStyles.flexRow,
      ...commonStyles.flex,
      minHeight: 48,
      justifyContent: 'flex-start',
    },
    helperTextContainer: {
      ...commonStyles.paddingHorizontal,
    },
    helperText: {
      color: theme.colors.onBackground,
    },
  });

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <View style={viewStyle}>
          <Button
            buttonColor={theme.colors.background}
            textColor={theme.colors.onBackground}
            labelStyle={styles.text}
            contentStyle={styles.content}
            style={styles.button}
            onPress={openMenu}
            disabled={disabled || isSubmitting}
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
      {choices.map((item, index) => {
        return (
          <React.Fragment key={index}>
            {index !== 0 && <Divider />}
            <Menu.Item onPress={() => handleSelect(item)} title={getTitle(item)} />
          </React.Fragment>
        );
      })}
      {addUndefinedOption && (
        <React.Fragment>
          <Menu.Item title={'None'} onPress={() => handleSelect(undefined)} />
        </React.Fragment>
      )}
    </Menu>
  );
};
