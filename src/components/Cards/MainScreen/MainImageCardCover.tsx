import {Card} from 'react-native-paper';
import React, {useEffect} from 'react';
// @ts-ignore
import DayImage from '../../../../assets/mainview_day.jpg';
// @ts-ignore
import NightImage from '../../../../assets/mainview_night.jpg';
// @ts-ignore
import SunsetImage from '../../../../assets/mainview_sunset.jpg';
// @ts-ignore
import HappyHourImage from '../../../../assets/mainview_happy.jpg';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import useDateTime from '../../../libraries/DateTime';

/**
 * Display a pretty image in the app based on the time of day.
 */
export const MainImageCardCover = () => {
  const {userNotificationData, refetchUserNotificationData} = useUserNotificationData();
  const updatingDate = useDateTime('hour');

  // Default to local, but override with the server offset.
  let currentHour = updatingDate.getHours();
  if (userNotificationData) {
    // Take the timestamp that the server gives us (UTC string), then apply the offset in milliseconds.
    // This becomes a new relative date that should match what the user is really experiencing.
    const serverTimestamp = Date.parse(userNotificationData.serverTime);
    const relativeTimestamp = serverTimestamp + userNotificationData.serverTimeOffset * 1000;
    const relativeDate = new Date(relativeTimestamp);
    currentHour = relativeDate.getUTCHours();
  }

  useEffect(() => {
    refetchUserNotificationData();
  }, [refetchUserNotificationData, updatingDate]);

  // 9PM-5AM Night
  // 6AM-3PM Day
  // 4PM Happy Hour
  // 5PM-7PM Sunset
  let sourceImage = NightImage;
  if (currentHour >= 6 && currentHour <= 15) {
    sourceImage = DayImage;
  } else if (currentHour === 16) {
    sourceImage = HappyHourImage;
  } else if (currentHour >= 17 && currentHour <= 20) {
    sourceImage = SunsetImage;
  }

  return <Card.Cover source={sourceImage} />;
};
