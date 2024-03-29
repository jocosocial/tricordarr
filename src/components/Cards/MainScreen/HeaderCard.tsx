import {Card} from 'react-native-paper';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {MainImageCardCover} from './MainImageCardCover';

/**
 * Card for the main screen.
 * Thought about making the date that it displays honor the lateDayFlip setting, but that
 * feels kinda weird upon reflection. Flipping the view is convenience, but saying its "Wednesday"
 * when it is in fact not "Wednesday" doesn't feel right.
 */
export const HeaderCard = () => {
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
      <MainImageCardCover />
      <Card.Title titleVariant={'bodyLarge'} titleStyle={[commonStyles.bold]} title={formattedDate} />
    </Card>
  );
};
