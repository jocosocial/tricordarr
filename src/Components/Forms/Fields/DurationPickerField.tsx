import React from 'react';

import {PickerField} from '#src/Components/Forms/Fields/PickerField';
import {AppIcons} from '#src/Enums/Icons';
import {formatMinutesToHumanReadable} from '#src/Libraries/DateTime';

interface DurationFieldProps {
  name: string;
  label: string;
  value: string;
}

const choices = ['30', '60', '90', '120', '180', '240'];

const getTitle = (choice: number | string) => formatMinutesToHumanReadable(Number(choice));

export const DurationPickerField = ({name, label, value}: DurationFieldProps) => {
  return (
    <PickerField name={name} label={label} value={value} choices={choices} icon={AppIcons.time} getTitle={getTitle} />
  );
};
