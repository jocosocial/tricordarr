import React from 'react';

import {PickerField} from '#src/Components/Forms/Fields/PickerField';

const getTitle = (value: number | undefined) => {
  switch (value) {
    case 0:
      return 'No Age Restrictions';
    case 6:
      return '6 and Younger';
    case 9:
      return '9 and Younger';
    case 12:
      return '12 and Younger';
    case 15:
      return '15 and Younger';
    default:
      return 'Unknown';
  }
};

export const BoardgameAgePickerField = ({value}: {value: number}) => {
  return (
    <PickerField<number | undefined>
      name={'maxAge'}
      label={'Age Restriction'}
      value={value}
      choices={[0, 6, 9, 12, 15]}
      getTitle={getTitle}
    />
  );
};
