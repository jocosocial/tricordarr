import {PickerField} from './PickerField';
import {AppIcons} from '../../../libraries/Enums/Icons';
import React from 'react';
import {FezType} from '../../../libraries/Enums/FezType';

interface FezTypePickerFieldProps {
  name: string;
  label: string;
  value: FezType;
}

const choices = [
  FezType.activity,
  FezType.dining,
  FezType.gaming,
  FezType.meetup,
  FezType.music,
  FezType.shore,
  FezType.other,
];

const getTitle = (choice: number | string) => String(choice);

export const FezTypePickerField = ({name, label, value}: FezTypePickerFieldProps) => {
  return (
    <PickerField name={name} label={label} value={value} choices={choices} icon={AppIcons.type} getTitle={getTitle} />
  );
};
