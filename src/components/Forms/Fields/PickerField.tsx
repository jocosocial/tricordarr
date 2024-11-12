import {Button, Divider, HelperText, Menu} from 'react-native-paper';
import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {useFormikContext} from 'formik';

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
}: PickerFieldProps<TData>) => {
  const [visible, setVisible] = React.useState(false);
  const {commonStyles, styleDefaults} = useStyles();
  const theme = useAppTheme();
  const {setFieldValue} = useFormikContext();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (newValue: TData | undefined) => {
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
    },
    text: {
      fontSize: styleDefaults.fontSize,
      fontWeight: 'normal',
      ...commonStyles.fontFamilyNormal,
      ...(anchorButtonMode === 'outlined' ? {marginHorizontal: 14} : undefined),
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
