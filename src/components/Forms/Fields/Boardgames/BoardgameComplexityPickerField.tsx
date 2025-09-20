import React from 'react';

import {PickerField} from '#src/Components/Forms/Fields/PickerField';

const getTitle = (value: number | undefined) => {
  switch (value) {
    case 1:
      return 'Very Simple Rules';
    case 3:
      return 'Medium Complexity';
    case 5:
      return 'Complex Rules';
    default:
      return 'Unknown';
  }
};

export const BoardgameComplexityPickerField = ({value}: {value: number}) => {
  return (
    <PickerField<number | undefined>
      name={'complexity'}
      label={'Complexity'}
      value={value}
      choices={[1, 3, 5]}
      getTitle={getTitle}
    />
  );
};
