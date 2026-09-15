import React from 'react';

import {PickerField} from '#src/Components/Forms/Fields/PickerField';
import {formatMinutesToHumanReadable} from '#src/Libraries/DateTime';

interface DurationFieldProps {
  name: string;
  testID: string;
  label: string;
  value: string;
}

const choices = ['30', '60', '90', '120', '180', '240'];

const getTitle = (choice: string | undefined) =>
  choice !== undefined ? formatMinutesToHumanReadable(Number(choice)) : '';

export const DurationPickerField = ({name, testID, label, value}: DurationFieldProps) => {
  return <PickerField name={name} testID={testID} label={label} value={value} choices={choices} getTitle={getTitle} />;
};
