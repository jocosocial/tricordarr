import React from 'react';
import {DatePickerInput, DatePickerModal} from 'react-native-paper-dates';
import {Button, HelperText} from 'react-native-paper';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {FastField, useField, useFormikContext} from 'formik';
import {View} from 'react-native';

interface DateTimePickerFieldProps {
  name: string;
}

export const DateTimePickerField = ({name}: DateTimePickerFieldProps) => {
  const {startDate, endDate} = useCruise();
  const [field, meta, helpers] = useField<string>(name);
  const {setFieldValue} = useFormikContext();

  const handleDateChange = (newValue: Date | undefined) => {
    if (newValue) {
      setFieldValue(name, newValue.toISOString());
    }
  };

  return (
    <FastField name={name}>
      {() => (
        <View>
          <DatePickerInput
            startYear={startDate.getFullYear()}
            endYear={startDate.getFullYear()}
            validRange={{startDate: startDate, endDate: endDate}}
            locale={'en'}
            onChange={handleDateChange}
            value={new Date(field.value)}
            inputMode={'start'}
            mode={'outlined'}
            label={'Date'}
            withDateFormatInLabel={false}
            presentationStyle={'pageSheet'}
            animationType={'none'}
          />
          <HelperText type={'error'} visible={!!meta.error && meta.touched}>
            {meta.error}
          </HelperText>
        </View>
      )}
    </FastField>
  );
};
