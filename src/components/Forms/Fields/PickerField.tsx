import {Button, Divider, Menu} from 'react-native-paper';
import React from 'react';
import {StyleSheet} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {AppIcon} from '../../Images/AppIcon';
import {useFormikContext} from 'formik';

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
      ...commonStyles.flexRow,
      minHeight: 48,
      ...commonStyles.alignItemsCenter,
    },
    text: {
      paddingLeft: 8,
      fontSize: styleDefaults.fontSize,
      fontWeight: 'normal',
      ...commonStyles.fontFamilyNormal,
    },
    content: {
      ...commonStyles.flexRow,
      ...commonStyles.flex,
    },
  });

  const getIcon = () => <AppIcon icon={icon} />;

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <Button
          buttonColor={theme.colors.background}
          textColor={theme.colors.onBackground}
          labelStyle={styles.text}
          contentStyle={styles.content}
          icon={getIcon}
          style={styles.button}
          onPress={openMenu}
          mode={'outlined'}>
          {label} ({getTitle(value)})
        </Button>
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
