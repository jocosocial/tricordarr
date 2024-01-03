import React from 'react';
import {TimePickerModal} from 'react-native-paper-dates';
import {Button} from 'react-native-paper';
import {useField, useFormikContext} from 'formik';
import {StyleSheet, View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {format} from 'date-fns';

interface TimePickerFieldProps {
  name: string;
}

interface TimePick {
  hours: number;
  minutes: number;
}

export const TimePickerField = ({name}: TimePickerFieldProps) => {
  const [field, meta, helpers] = useField<TimePick>(name);
  const {setFieldValue} = useFormikContext();
  const [visible, setVisible] = React.useState(false);
  const {commonStyles, styleDefaults} = useStyles();
  const theme = useAppTheme();

  const onDismiss = React.useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const onConfirm = ({hours, minutes}: TimePick) => {
    setVisible(false);
    setFieldValue(name, {
      hours: hours,
      minutes: minutes,
    });
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

  const getTimeLabel = () => {
    let eventStartDate = new Date(0);
    eventStartDate.setHours(field.value.hours);
    eventStartDate.setMinutes(field.value.minutes);
    return format(eventStartDate, 'hh:mm a');
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
      <TimePickerModal
        visible={visible}
        onDismiss={onDismiss}
        onConfirm={onConfirm}
        hours={field.value.hours}
        minutes={field.value.minutes}
      />
    </View>
  );
};
