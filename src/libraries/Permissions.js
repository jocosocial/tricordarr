import {PermissionsAndroid} from 'react-native';

export const requestPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
      title: 'WiFi Permission',
      message: 'needs da wifi',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the wifi');
    } else {
      console.log('wifi permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};
