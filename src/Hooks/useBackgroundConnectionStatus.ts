import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {getSharedWebSocket} from '#src/Libraries/Notifications/Push/Android/ForegroundService';
import {isAndroid} from '#src/Libraries/Platform/Detection';
import {StorageKeys} from '#src/Libraries/Storage';
import {WebsocketDebugStatus} from '#src/Structs/SocketStructs';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

export type BackgroundConnectionStatus = 'disabled' | 'connected' | 'warning' | 'error';

// While not connected (e.g. right after login, before the worker's socket has come up),
// poll quickly so the indicator converges fast instead of waiting for the slower
// user-configured healthcheck interval.
const FAST_POLL_INTERVAL_MS = 2000;

const deriveStatus = (isOpen: boolean, healthStatus?: WebsocketDebugStatus | null): BackgroundConnectionStatus => {
  if (healthStatus?.lastHealthcheckSuccess === false) {
    return 'error';
  }
  return isOpen ? 'connected' : 'warning';
};

/**
 * Live health of the background notification path (Android foreground-service socket,
 * or iOS native background push manager socket). Polls the same status primitives used
 * by BackgroundConnectionSettingsAndroidView/IOSView: quickly while not yet connected,
 * at the user's configured healthcheck interval once connected, and again whenever the
 * app returns to the foreground.
 */
export const useBackgroundConnectionStatus = (): BackgroundConnectionStatus => {
  const {enableUserNotifications} = useEnableUserNotification();
  const {appConfig} = useConfig();
  const [status, setStatus] = useState<BackgroundConnectionStatus>('disabled');

  const checkStatus = useCallback(async (): Promise<BackgroundConnectionStatus> => {
    if (!enableUserNotifications) {
      return 'disabled';
    }

    if (isAndroid) {
      const ws = await getSharedWebSocket();
      const isOpen = ws?.readyState === WebSocket.OPEN;
      const item = await AsyncStorage.getItem(StorageKeys.WS_HEALTHCHECK_DATA);
      const healthStatus = item ? (JSON.parse(item) as WebsocketDebugStatus) : undefined;
      return deriveStatus(isOpen, healthStatus);
    }
    const healthStatus = await NativeTricordarrModule.getWebsocketStatus();
    return deriveStatus(healthStatus.state === 'Open', healthStatus);
  }, [enableUserNotifications]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      const next = await checkStatus();
      if (cancelled) {
        return;
      }
      setStatus(next);
      const delay =
        next === 'connected' || next === 'disabled' ? appConfig.fgsWorkerHealthTimer : FAST_POLL_INTERVAL_MS;
      timeoutId = setTimeout(poll, delay);
    };
    poll();

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        clearTimeout(timeoutId);
        poll();
      }
    };
    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      subscription.remove();
    };
  }, [checkStatus, appConfig.fgsWorkerHealthTimer]);

  return status;
};
