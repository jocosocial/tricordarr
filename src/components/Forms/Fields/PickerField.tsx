import {Button, Divider, Menu} from 'react-native-paper';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {useFormikContext} from 'formik';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';

interface PickerFieldProps {
  name: string;
  label: string;
  value: number | string;
  choices: (number | string)[];
  icon: string;
  getTitle: (value: number | string) => string;
}

export const PickerField = ({name, label, value, choices, icon, getTitle}: PickerFieldProps) => {
  const [visible, setVisible] = React.useState(false);
  const {commonStyles, styleDefaults} = useStyles();
  const theme = useAppTheme();
  const {setFieldValue} = useFormikContext();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (newValue: number | string) => {
    setFieldValue(name, newValue);
    closeMenu();
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
      marginHorizontal: 14,
    },
    content: {
      ...commonStyles.flexRow,
      ...commonStyles.flex,
      minHeight: 48,
      justifyContent: 'flex-start',
    },
  });

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <View>
          <Button
            buttonColor={theme.colors.background}
            textColor={theme.colors.onBackground}
            labelStyle={styles.text}
            contentStyle={styles.content}
            style={styles.button}
            onPress={openMenu}
            mode={'outlined'}>
            {label} ({getTitle(value)})
          </Button>
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
    </Menu>
  );
};
