import {Card} from 'react-native-paper';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useCruise} from '../../Context/Contexts/CruiseContext';
// @ts-ignore
import MainViewDayImage from '../../../../assets/mainview_day.jpg';

export const HeaderCard = () => {
  const {commonStyles} = useStyles();
  const {cruiseDayIndex, cruiseLength} = useCruise();

  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = date.toLocaleString('en-US', options);

  let subtitleText = '';
  if (cruiseDayIndex < 0) {
    subtitleText = `${Math.abs(cruiseDayIndex)} day(s) until boat!`;
  } else if (cruiseDayIndex < cruiseLength - 1) {
    subtitleText = `Day ${cruiseDayIndex + 1}`;
  } else {
    subtitleText = `${cruiseDayIndex - cruiseLength + 1} days after boat.`;
  }

  return (
    <Card style={[commonStyles.marginBottomSmall]}>
      <Card.Cover source={MainViewDayImage} />
      <Card.Title
        titleVariant={'bodyLarge'}
        titleStyle={[commonStyles.bold]}
        title={formattedDate}
        subtitle={subtitleText}
      />
    </Card>
  );
};
