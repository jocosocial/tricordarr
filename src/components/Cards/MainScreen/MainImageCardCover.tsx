import {Card} from 'react-native-paper';
import React from 'react';
// @ts-ignore
import DayImage from '../../../../assets/mainview_day.jpg';
// @ts-ignore
import NightImage from '../../../../assets/mainview_night.jpg';
// @ts-ignore
import SunsetImage from '../../../../assets/mainview_sunset.jpg';
// @ts-ignore
import HappyHourImage from '../../../../assets/mainview_happy.jpg';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {TouchableOpacity} from 'react-native';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

/**
 * Display a pretty image in the app based on the time of day.
 */
export const MainImageCardCover = () => {
  const {userNotificationData} = useUserNotificationData();
  const {hourlyUpdatingDate} = useCruise();
  const {setErrorMessage} = useErrorHandler();

  // Default to local, but override with the server offset.
  let currentHour = hourlyUpdatingDate.getHours();
  if (userNotificationData) {
    // Take the timestamp that the server gives us (UTC string), then apply the offset in milliseconds.
    // This becomes a new relative date that should match what the user is really experiencing.
    const serverTimestamp = Date.parse(userNotificationData.serverTime);
    const relativeTimestamp = serverTimestamp + userNotificationData.serverTimeOffset * 1000;
    const relativeDate = new Date(relativeTimestamp);
    currentHour = relativeDate.getUTCHours();
  }

  // 9PM-5AM (21:00-05:00) Night
  // 6AM-3PM (06:00-15:00) Day
  // 4PM (16:00) Wang Wang Happy Hour
  // 5PM-8PM (17:00-20:00) Sunset
  let sourceImage = NightImage;
  if (currentHour >= 6 && currentHour <= 15) {
    sourceImage = DayImage;
  } else if (currentHour === 16) {
    sourceImage = HappyHourImage;
  } else if (currentHour >= 17 && currentHour <= 20) {
    sourceImage = SunsetImage;
  }

  const debugPress = () => {
    setErrorMessage(`The current hour is ${currentHour}`);
  };

  return (
    <TouchableOpacity onPress={debugPress}>
      <Card.Cover source={sourceImage} />
    </TouchableOpacity>
  );
};
