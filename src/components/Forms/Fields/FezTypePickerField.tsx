import {PickerField} from './PickerField';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {formatMinutesToHumanReadable} from '../../../libraries/DateTime';
import React from 'react';
import {FezType} from '../../../libraries/Enums/FezType';

interface DurationFieldProps {
  name: string;
  label: string;
  value: number;
}

const choices = Object.keys(FezType);

const getTitle = (choice: number | string) => String(choice);

export const FezTypePickerField = ({name, label, value}: DurationFieldProps) => {
  return (
    <PickerField name={name} label={label} value={value} choices={choices} icon={AppIcons.type} getTitle={getTitle} />
  );
};
