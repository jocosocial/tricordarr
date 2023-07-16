import {Card} from 'react-native-paper';
import MainViewDayImage from '../../../../assets/mainview_day.jpg';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useCruise} from '../../Context/Contexts/CruiseContext';

export const HeaderCard = () => {
  const {commonStyles} = useStyles();
  const {cruiseDayIndex} = useCruise();
  const cruiseDayNumber = cruiseDayIndex + 1;

  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = date.toLocaleString('en-US', options);
  const subtitleText = `${cruiseDayIndex}`;
  // const subtitleText = cruiseDayIndex <= 0 ? `Day ${cruiseDayNumber}` : `${Math.abs(cruiseDayNumber)} day(s) until boat.`;

  return (
    <Card style={[commonStyles.marginBottomSmall]}>
      <Card.Cover source={MainViewDayImage} />
      <Card.Title titleVariant={'bodyLarge'} titleStyle={[commonStyles.bold]} title={formattedDate} subtitle={subtitleText} />
    </Card>
  );
};
