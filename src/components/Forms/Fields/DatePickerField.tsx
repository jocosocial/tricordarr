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

interface DatePickerFieldProps {
  name: string;
}

export const DatePickerField = ({name}: DatePickerFieldProps) => {
  const {startDate, endDate} = useCruise();
  const [field, meta, helpers] = useField<Date>(name);
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
      ...commonStyles.flexRow,
      minHeight: 48,
      ...commonStyles.alignItemsCenter,
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
        Date ({getDateFormat()})
      </Button>
      <DatePickerModal
        visible={visible}
        onDismiss={onDismiss}
        onConfirm={onConfirm}
        date={field.value}
        locale={'en'}
        mode={'single'}
        startYear={startDate.getFullYear()}
        endYear={startDate.getFullYear()}
        validRange={{startDate: startDate, endDate: endDate}}
      />
    </View>
  );
};
