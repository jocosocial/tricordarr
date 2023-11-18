import React from 'react';
import {TimePickerModal} from 'react-native-paper-dates';
import {Button} from 'react-native-paper';
import {useField, useFormikContext} from 'formik';
import {StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {AppIcon} from '../../Images/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {format} from 'date-fns';

interface TimePickerFieldProps {
  name: string;
}

export const TimePickerField = ({name}: TimePickerFieldProps) => {
  const [field, meta, helpers] = useField<string>(name);
  const {setFieldValue} = useFormikContext();
  const [visible, setVisible] = React.useState(false);
  const {commonStyles, styleDefaults} = useStyles();
  const theme = useAppTheme();

  const onDismiss = React.useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const onConfirm = React.useCallback(
    ({hours, minutes}: {hours: number; minutes: number}) => {
      setVisible(false);
      let eventStartDate = new Date(field.value);
      eventStartDate.setHours(hours);
      eventStartDate.setMinutes(minutes);
      setFieldValue(name, eventStartDate.toISOString());
    },
    [field.value, name, setFieldValue],
  );

  const styles = StyleSheet.create({
    button: {
      ...commonStyles.roundedBorder,
      ...commonStyles.flexRow,
      minHeight: 48,
      ...commonStyles.alignItemsCenter,
    },
    text: {
      // paddingLeft: 8,
      fontSize: styleDefaults.fontSize,
      fontWeight: 'normal',
      ...commonStyles.fontFamilyNormal,
    },
    content: {
      ...commonStyles.flexRow,
      ...commonStyles.flex,
    },
  });

  const getTimeLabel = () => {
    let eventStartDate = new Date(field.value);
    return format(eventStartDate, 'HH:mm a');
  };

  return (
    <View>
      <Button
        buttonColor={theme.colors.background}
        textColor={theme.colors.onBackground}
        labelStyle={styles.text}
        contentStyle={styles.content}
        style={styles.button}
        onPress={() => setVisible(true)}
        mode={'outlined'}>
        Time ({getTimeLabel()})
      </Button>
      <TimePickerModal visible={visible} onDismiss={onDismiss} onConfirm={onConfirm} hours={12} minutes={14} />
    </View>
  );
};
