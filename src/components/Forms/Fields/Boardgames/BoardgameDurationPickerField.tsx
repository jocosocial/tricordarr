import React from 'react';

import {PickerField} from '#src/Components/Forms/Fields/PickerField';

const getTitle = (value: number | undefined) => {
  switch (value) {
    case 30:
      return '30 Minutes';
    case 60:
      return '1 Hour';
    case 90:
      return '1 1/2 Hours';
    case 120:
      return '2 Hours';
    case 150:
      return '2 1/2 Hours';
    case 180:
      return '3 Hours';
    default:
      return 'More than 3 Hours';
  }
};

export const BoardgameDurationPickerField = ({value}: {value: number}) => {
  return (
    <PickerField<number | undefined>
      name={'timeToPlay'}
      label={'Time To Play'}
      value={value}
      choices={[30, 60, 90, 120, 150, 180, 1000]}
      getTitle={getTitle}
    />
  );
};
