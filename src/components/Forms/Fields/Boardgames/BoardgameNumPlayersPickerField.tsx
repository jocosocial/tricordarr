import React from 'react';

import {PickerField} from '#src/Components/Forms/Fields/PickerField';

const getTitle = (value: number | undefined) => {
  switch (value) {
    case 1:
      return 'One Player';
    case 2:
      return 'Two Players';
    case 3:
      return 'Three Players';
    case 4:
      return 'Four Players';
    case 5:
      return 'Five Players';
    case 6:
      return 'Six Players';
    default:
      return 'Many Players';
  }
};

export const BoardgameNumPlayersPickerField = ({value}: {value: number}) => {
  return (
    <PickerField<number | undefined>
      name={'numPlayers'}
      label={'Number of Players'}
      value={value}
      choices={[1, 2, 3, 4, 5, 6, 10]}
      getTitle={getTitle}
    />
  );
};
