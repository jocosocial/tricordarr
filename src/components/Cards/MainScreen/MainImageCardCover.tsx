import {Card} from 'react-native-paper';
import React from 'react';
// @ts-ignore
import DayImage from '../../../../assets/mainview_day.jpg';
// @ts-ignore
import NightImage from '../../../../assets/mainview_night.jpg';
// @ts-ignore
import SunsetImage from '../../../../assets/mainview_sunset.jpg';

export const MainImageCardCover = () => {

  // @TODO factor in server time offset.
  const currentHour = new Date().getHours();

  // 8PM-5AM Night
  // 6AM-4PM Day
  // 5PM-7PM Sunset
  let sourceImage = NightImage;
  if (currentHour >= 6 && currentHour <= 16) {
    sourceImage = DayImage;
  } else if (currentHour >= 17 && currentHour <= 19) {
    sourceImage = SunsetImage;
  }

  return <Card.Cover source={sourceImage} />;
};
