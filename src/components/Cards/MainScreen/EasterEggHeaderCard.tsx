import {Card} from 'react-native-paper';
import React from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import {EasterEggImageCardCover} from './EasterEggImageCardCover';

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
