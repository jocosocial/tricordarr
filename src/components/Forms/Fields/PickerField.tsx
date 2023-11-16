import {Button, Divider, Menu} from 'react-native-paper';
import React from 'react';
import {StyleSheet} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {formatMinutesToHumanReadable} from '../../../libraries/DateTime';
import {useAppTheme} from '../../../styles/Theme';
import {AppIcon} from '../../Images/AppIcon';
import {useFormikContext} from 'formik';

const durations = [30, 60, 90, 120, 180, 240];

interface PickerFieldProps {
  name: string;
  label: string;
  value: number;
}

export const PickerField = ({name, label, value}: PickerFieldProps) => {
  const [visible, setVisible] = React.useState(false);
  const {commonStyles, styleDefaults} = useStyles();
  const theme = useAppTheme();
  const {setFieldValue} = useFormikContext();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (newValue: number) => {
    setFieldValue(name, newValue);
    console.log(newValue);
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

  const getIcon = () => <AppIcon icon={AppIcons.time} />;

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
          {label} ({formatMinutesToHumanReadable(value)})
        </Button>
      }>
      {durations.map((duration, index) => {
        return (
          <React.Fragment key={index}>
            {index !== 0 && <Divider />}
            <Menu.Item onPress={() => handleSelect(duration)} title={formatMinutesToHumanReadable(duration)} />
          </React.Fragment>
        );
      })}
    </Menu>
  );
};
