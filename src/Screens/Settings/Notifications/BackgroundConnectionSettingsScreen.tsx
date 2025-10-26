import {Platform} from 'react-native';

import {BackgroundConnectionSettingsAndroidView} from '#src/Components/Views/Settings/BackgroundConnectionSettingsAndroidView';
import {BackgroundConnectionSettingsIOSView} from '#src/Components/Views/Settings/BackgroundConnectionSettingsIOSView';

export const BackgroundConnectionSettingsScreen = () => {
  return Platform.OS === 'android' ? (
    <BackgroundConnectionSettingsAndroidView />
  ) : (
    <BackgroundConnectionSettingsIOSView />
  );
};
