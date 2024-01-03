import {Card} from 'react-native-paper';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {differenceInDays} from 'date-fns';
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
  // JS months are 0-indexed
  const daysSince = differenceInDays(date, new Date(2023, 10, 12));
  let subtitleText = `${daysSince} days since Lauren & Mike's wedding!`;

  return (
    <Card>
      <EasterEggImageCardCover />
      <Card.Title
        titleVariant={'bodyLarge'}
        titleStyle={[commonStyles.bold]}
        title={formattedDate}
        subtitle={subtitleText}
      />
    </Card>
  );
};
