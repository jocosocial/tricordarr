import {isAndroid} from '#src/Libraries/Platform/Detection';

import {BackgroundConnectionSettingsAndroidView} from '#src/Components/Views/Settings/BackgroundConnectionSettingsAndroidView';
import {BackgroundConnectionSettingsIOSView} from '#src/Components/Views/Settings/BackgroundConnectionSettingsIOSView';

export const BackgroundConnectionSettingsScreen = () => {
  return isAndroid ? (
    <BackgroundConnectionSettingsAndroidView />
  ) : (
    <BackgroundConnectionSettingsIOSView />
  );
};
