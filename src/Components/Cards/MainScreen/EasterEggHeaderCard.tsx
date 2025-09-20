import React from 'react';
import {Card} from 'react-native-paper';

import {EasterEggImageCardCover} from '#src/Components/Cards/MainScreen/EasterEggImageCardCover';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const EasterEggHeaderCard = () => {
  const {commonStyles} = useStyles();

  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = date.toLocaleString('en-US', options);

  return (
    <Card>
      <EasterEggImageCardCover />
      <Card.Title titleVariant={'bodyLarge'} titleStyle={[commonStyles.bold]} title={formattedDate} />
    </Card>
  );
};
