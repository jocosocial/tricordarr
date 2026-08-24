import React from 'react';

import {PickerField} from '#src/Components/Forms/Fields/PickerField';
import {FezType} from '#src/Enums/FezType';

interface FezTypePickerFieldProps {
  name: string;
  testID: string;
  label: string;
  value: FezType;
  choices?: FezType[];
}

const getTitle = (choice: FezType | undefined) => FezType.getLabel(choice);

export const FezTypePickerField = ({
  name,
  testID,
  label,
  value,
  choices = FezType.lfgTypes,
}: FezTypePickerFieldProps) => {
  return (
    <PickerField<FezType | undefined>
      name={name}
      testID={testID}
      label={label}
      value={value}
      choices={choices}
      getTitle={getTitle}
    />
  );
};
