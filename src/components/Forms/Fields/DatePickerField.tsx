import React from 'react';
import {DatePickerModal} from 'react-native-paper-dates';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {useField, useFormikContext} from 'formik';
import {StyleSheet, View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {Button} from 'react-native-paper';
import {format} from 'date-fns';
import {CalendarDate} from 'react-native-paper-dates/src/Date/Calendar';
import {ValidRangeType} from 'react-native-paper-dates/src/Date/Calendar.tsx';

interface DatePickerFieldProps {
  name: string;
  limitRange?: boolean;
  startYear?: number;
  endYear?: number;
  validRange?: ValidRangeType;
  label?: string;
}

export const DatePickerField = ({
  name,
  limitRange = true,
  startYear,
  endYear,
  validRange,
  label = 'Date',
}: DatePickerFieldProps) => {
  const {startDate, endDate} = useCruise();
  const [field] = useField<Date>(name);
  const {setFieldValue} = useFormikContext();
  const [visible, setVisible] = React.useState(false);
  const {commonStyles, styleDefaults} = useStyles();
  const theme = useAppTheme();

  const onDismiss = React.useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const onConfirm = (params: {date: CalendarDate}) => {
    setVisible(false);
    if (params.date) {
      setFieldValue(name, params.date);
    }
  };

  const styles = StyleSheet.create({
    button: {
      ...commonStyles.roundedBorder,
      ...commonStyles.flex,
      minHeight: 48,
    },
    text: {
      // paddingLeft: 8,
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

  const getDateFormat = () => {
    return format(field.value, 'MM/dd/yyyy');
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
        {label} ({getDateFormat()})
      </Button>
      <DatePickerModal
        visible={visible}
        onDismiss={onDismiss}
        onConfirm={onConfirm}
        date={field.value}
        locale={'en'}
        mode={'single'}
        startYear={limitRange ? startDate.getFullYear() : startYear}
        endYear={limitRange ? startDate.getFullYear() : endYear}
        validRange={limitRange ? {startDate: startDate, endDate: endDate} : validRange}
      />
    </View>
  );
};
