import React from 'react';

import {PickerField} from '#src/Components/Forms/Fields/PickerField';
import {ShipCode} from '#src/Enums/ShipCode';

interface ShipCodePickerFieldProps {
  name: string;
  testID: string;
  label: string;
  value: ShipCode;
  disabled?: boolean;
}

const getTitle = (choice: ShipCode | undefined) => ShipCode.getLabel(choice);

export const ShipCodePickerField = ({name, testID, label, value, disabled}: ShipCodePickerFieldProps) => {
  return (
    <PickerField<ShipCode | undefined>
      name={name}
      testID={testID}
      label={label}
      value={value}
      choices={ShipCode.all}
      getTitle={getTitle}
      disabled={disabled}
    />
  );
};
