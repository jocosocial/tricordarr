import {Card} from 'react-native-paper';
import React, {useState} from 'react';
// @ts-ignore
import DayImage from '../../../../assets/mainview_day.jpg';
// @ts-ignore
import NightImage from '../../../../assets/mainview_night.jpg';
// @ts-ignore
import SunsetImage from '../../../../assets/mainview_sunset.jpg';
// @ts-ignore
import MainShowImage from '../../../../assets/mainview_mainshow.jpg';
// @ts-ignore
import LateShowImage from '../../../../assets/mainview_lateshow.jpg';
// @ts-ignore
import HappyHourImage from '../../../../assets/mainview_happy.jpg';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {Image, TouchableOpacity, View} from 'react-native';
import {AppImageViewer} from '../../Images/AppImageViewer';
import {ImageQueryData} from '../../../Libraries/Types';
import {encode as base64_encode} from 'base-64';

/**
 * Display a pretty image in the app based on the time of day.
 */
export const MainImageCardCover = () => {
  // const {userNotificationData} = useUserNotificationData();
  const {hourlyUpdatingDate} = useCruise();
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  // Default to local, but override with the server offset.
  let currentHour = hourlyUpdatingDate.getHours();
  // Disabling this to see how it goes by using the users calendar instead of the server time.
  // if (userNotificationData) {
  //   // Take the timestamp that the server gives us (UTC string), then apply the offset in milliseconds.
  //   // This becomes a new relative date that should match what the user is really experiencing.
  //   const serverTimestamp = Date.parse(userNotificationData.serverTime);
  //   const relativeTimestamp = serverTimestamp + userNotificationData.serverTimeOffset * 1000;
  //   const relativeDate = new Date(relativeTimestamp);
  //   currentHour = relativeDate.getUTCHours();
  // }

  // 9PM-5AM (21:00-05:00) Night
  // 6AM-3PM (06:00-15:00) Day
  // 4PM (16:00) Wang Wang Happy Hour
  // 5PM (17:00) Main Show
  // 7PM (19:00) Sunset
  // 9PM (21:00) Night
  let sourceImage = NightImage;
  let viewerIndex = 5;
  if (currentHour >= 6 && currentHour <= 15) {
    sourceImage = DayImage;
    viewerIndex = 0;
  } else if (currentHour === 16) {
    sourceImage = HappyHourImage;
    viewerIndex = 1;
  } else if (currentHour >= 17 && currentHour <= 18) {
    sourceImage = MainShowImage;
    viewerIndex = 2;
  } else if (currentHour >= 19 && currentHour <= 20) {
    sourceImage = SunsetImage;
    viewerIndex = 3;
  } else if (currentHour >= 21 && currentHour <= 23) {
    sourceImage = LateShowImage;
    viewerIndex = 4;
  }

  const viewerImages: ImageQueryData[] = [
    {
      dataURI: Image.resolveAssetSource(DayImage).uri,
      mimeType: 'image/jpeg',
      fileName: 'TwitarrDayImage.jpg',
      base64: base64_encode(DayImage),
    },
    {
      dataURI: Image.resolveAssetSource(HappyHourImage).uri,
      mimeType: 'image/jpeg',
      fileName: 'TwitarrHappyHourImage.jpg',
      base64: base64_encode(HappyHourImage),
    },
    {
      dataURI: Image.resolveAssetSource(MainShowImage).uri,
      mimeType: 'image/jpeg',
      fileName: 'TwitarrMainShowImage.jpg',
      base64: base64_encode(MainShowImage),
    },
    {
      dataURI: Image.resolveAssetSource(SunsetImage).uri,
      mimeType: 'image/jpeg',
      fileName: 'TwitarrSunsetImage.jpg',
      base64: base64_encode(SunsetImage),
    },
    {
      dataURI: Image.resolveAssetSource(LateShowImage).uri,
      mimeType: 'image/jpeg',
      fileName: 'TwitarrLateShowImage.jpg',
      base64: base64_encode(LateShowImage),
    },
    {
      dataURI: Image.resolveAssetSource(NightImage).uri,
      mimeType: 'image/jpeg',
      fileName: 'TwitarrNightImage.jpg',
      base64: base64_encode(NightImage),
    },
  ];

  // Have to disable download since loading static images is actually really hard and I don't feel
  // like figuring it out right now.
  // https://javascript.plainenglish.io/using-images-in-react-native-668e3a835858
  return (
    <View>
      <AppImageViewer
        viewerImages={viewerImages}
        isVisible={isViewerVisible}
        setIsVisible={setIsViewerVisible}
        enableDownload={false}
        initialIndex={viewerIndex}
      />
      <TouchableOpacity onPress={() => setIsViewerVisible(true)}>
        <Card.Cover source={sourceImage} />
      </TouchableOpacity>
    </View>
  );
};
