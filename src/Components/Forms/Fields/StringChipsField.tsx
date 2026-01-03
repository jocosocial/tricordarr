import {useField} from 'formik';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Chip, HelperText, IconButton, Text, TextInput} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';

interface StringChipsFieldProps {
  name: string;
  label?: string;
  helperText?: string;
  onAddValue?: () => void;
  onRemoveValue?: () => void;
  inputLabel?: string;
  disabled?: boolean;
}
export const StringChipsField = ({
  name,
  label,
  helperText,
  onAddValue,
  onRemoveValue,
  inputLabel = 'Add new value',
  disabled = false,
}: StringChipsFieldProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const [field, _meta, helpers] = useField<string[]>(name);
  const [inputValue, setInputValue] = React.useState('');

  const styles = StyleSheet.create({
    chipsContainer: {
      ...commonStyles.chipContainer,
      ...commonStyles.paddingHorizontalSmall,
    },
    parentContainer: {
      ...commonStyles.flex,
    },
    inputContainer: {
      ...commonStyles.flex,
      ...commonStyles.flexRow,
      ...commonStyles.paddingBottomSmall,
      ...commonStyles.paddingHorizontalSmall,
    },
    buttonContainer: {
      ...commonStyles.flexEnd,
    },
    fieldContainer: {
      ...commonStyles.flex,
    },
  });

  const addValue = async (value: string) => {
    // https://stackoverflow.com/questions/1988349/array-push-if-does-not-exist
    const existingIndex = field.value.findIndex(v => v === value);
    if (existingIndex === -1) {
      await helpers.setValue(field.value.concat([value]));
      setInputValue('');
      if (onAddValue) {
        onAddValue();
      }
    }
  };

  const removeValue = async (value: string) => {
    await helpers.setValue(field.value.filter(v => v !== value));
    if (onRemoveValue) {
      onRemoveValue();
    }
  };

  return (
    <View style={styles.parentContainer}>
      {label && <Text>{label}</Text>}
      {helperText && <HelperText type={'info'}>{helperText}</HelperText>}
      <View style={styles.chipsContainer}>
        {field.value.flatMap(value => (
          <Chip key={value} style={commonStyles.chip} onClose={() => removeValue(value)}>
            {value}
          </Chip>
        ))}
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.fieldContainer}>
          <TextInput
            mode={'outlined'}
            inputMode={'text'}
            keyboardType={'default'}
            autoCapitalize={'none'}
            value={inputValue}
            onChangeText={setInputValue}
            multiline={false}
            label={inputLabel}
            disabled={disabled}
          />
        </View>
        <View style={styles.buttonContainer}>
          <IconButton
            mode={'contained'}
            iconColor={theme.colors.onBackground}
            disabled={!inputValue || disabled}
            icon={AppIcons.new}
            onPress={() => addValue(inputValue)}
          />
        </View>
      </View>
    </View>
  );
};
