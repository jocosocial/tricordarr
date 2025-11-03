import {Platform} from 'react-native';

import {
  startForegroundServiceWorker,
  stopForegroundServiceWorker,
} from '#src/Libraries/Notifications/Push/Android/ForegroundService';
import {startLocalPushManager} from '#src/Libraries/Notifications/Push/IOS/LocalPushManager';
import {stopLocalPushManager} from '#src/Libraries/Notifications/Push/IOS/LocalPushManager';

export const startPushProvider = async () => {
  if (Platform.OS === 'ios') {
    await startLocalPushManager();
  } else {
    await startForegroundServiceWorker();
  }
};
export const stopPushProvider = async () => {
  if (Platform.OS === 'ios') {
    await stopLocalPushManager();
  } else {
    await stopForegroundServiceWorker();
  }
};
