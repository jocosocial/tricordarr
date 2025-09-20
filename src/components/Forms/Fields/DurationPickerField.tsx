import {PickerField} from './PickerField';
import {AppIcons} from '../../../Libraries/Enums/Icons';
import {formatMinutesToHumanReadable} from '../../../Libraries/DateTime';
import React from 'react';

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
