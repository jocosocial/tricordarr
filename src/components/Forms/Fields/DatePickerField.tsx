import React from 'react';
import {DatePickerInput} from 'react-native-paper-dates';
import {HelperText} from 'react-native-paper';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {FastField, useField, useFormikContext} from 'formik';
import {View} from 'react-native';

interface DatePickerFieldProps {
  name: string;
}

export const DatePickerField = ({name}: DatePickerFieldProps) => {
  const {startDate, endDate} = useCruise();
  const [field, meta, helpers] = useField<string>(name);
  const {setFieldValue} = useFormikContext();

  const handleDateChange = (newValue: Date | undefined) => {
    if (newValue) {
      setFieldValue(name, newValue.toISOString());
    }
  };

  // If the user removes the text, it doesn't change the value. onChangeText can be used for that but it freaks
  // out if the value is invalid (which is probably is).
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
        </View>
      )}
    </FastField>
  );
};
