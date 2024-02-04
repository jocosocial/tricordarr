import {Card} from 'react-native-paper';
import React, {useState} from 'react';
// @ts-ignore
import DayImage from '../../../../assets/easteregg_day.jpg';
// @ts-ignore
import NightImage from '../../../../assets/easteregg_night.jpg';
// @ts-ignore
import SunsetImage from '../../../../assets/easteregg_sunset.jpg';
// @ts-ignore
import HappyHourImage from '../../../../assets/easteregg_happy.jpg';
import {Image, TouchableOpacity, View} from 'react-native';
import {AppImageViewer} from '../../Images/AppImageViewer';
import {ImageQueryData} from '../../../libraries/Types';
import {encode as base64_encode} from 'base-64';
import {useCruise} from '../../Context/Contexts/CruiseContext';

/**
 * Display a pretty image in the app based on the time of day.
 */
export const EasterEggImageCardCover = () => {
  const {hourlyUpdatingDate} = useCruise();
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  // Default to local, but override with the server offset.
  let currentHour = hourlyUpdatingDate.getHours();

  // 9PM-5AM (21:00-05:00) Night
  // 6AM-3PM (06:00-15:00) Day
  // 4PM (16:00) Wang Wang Happy Hour
  // 5PM-8PM (17:00-20:00) Sunset
  let sourceImage = NightImage;
  let viewerIndex = 3;
  if (currentHour >= 6 && currentHour <= 15) {
    sourceImage = DayImage;
    viewerIndex = 0;
  } else if (currentHour === 16) {
    sourceImage = HappyHourImage;
    viewerIndex = 1;
  } else if (currentHour >= 17 && currentHour <= 20) {
    sourceImage = SunsetImage;
    viewerIndex = 2;
  }

  const viewerImages: ImageQueryData[] = [
    {
      dataURI: Image.resolveAssetSource(DayImage).uri,
      mimeType: 'image/jpeg',
      fileName: 'EasterEggDayImage.jpg',
      base64: base64_encode(DayImage),
    },
    {
      dataURI: Image.resolveAssetSource(HappyHourImage).uri,
      mimeType: 'image/jpeg',
      fileName: 'EasterEggHappyHourImage.jpg',
      base64: base64_encode(HappyHourImage),
    },
    {
      dataURI: Image.resolveAssetSource(SunsetImage).uri,
      mimeType: 'image/jpeg',
      fileName: 'EasterEggSunsetImage.jpg',
      base64: base64_encode(SunsetImage),
    },
    {
      dataURI: Image.resolveAssetSource(NightImage).uri,
      mimeType: 'image/jpeg',
      fileName: 'EasterEggNightImage.jpg',
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
