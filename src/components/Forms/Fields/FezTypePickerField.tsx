import {PickerField} from './PickerField';
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

const getTitle = (choice: FezType | undefined) => FezType.getLabel(choice);

export const FezTypePickerField = ({name, label, value}: FezTypePickerFieldProps) => {
  return (
    <PickerField<FezType | undefined> name={name} label={label} value={value} choices={choices} getTitle={getTitle} />
  );
};
