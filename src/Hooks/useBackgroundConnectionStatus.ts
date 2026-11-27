import {useCallback, useEffect, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {createLogger} from '#src/Libraries/Logger';
import {getCurrentBackgroundStatus} from '#src/Libraries/Notifications/Push/BackgroundStatus';
import {PerAccountStatus} from '#src/Structs/SocketStructs';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('useBackgroundConnectionStatus.ts');

export type BackgroundConnectionStatus = 'disabled' | 'connected' | 'warning' | 'error';

// While not connected (e.g. right after login, before the worker's socket has come up),
// poll quickly so the indicator converges fast instead of waiting for the slower
// user-configured healthcheck interval.
const FAST_POLL_INTERVAL_MS = 2000;

const deriveStatus = (isOpen: boolean, healthStatus?: PerAccountStatus | null): BackgroundConnectionStatus => {
  if (healthStatus?.lastHealthcheckSuccess === false) {
    return 'error';
  }
  return isOpen ? 'connected' : 'warning';
};

/**
 * Live health of the background notification path (Android native foreground-service socket,
 * or iOS native background push manager socket). Pulls `getWebsocketStatus()`, the same
 * primitive used by BackgroundConnectionSettingsAndroidView/IOSView: quickly while not yet
 * connected, at the user's configured healthcheck interval once connected, and again whenever
 * the app returns to the foreground or Android reports a status change.
 */
export const useBackgroundConnectionStatus = (): BackgroundConnectionStatus => {
  const {enableUserNotifications} = useEnableUserNotification();
  const {appConfig} = useConfig();
  const [status, setStatus] = useState<BackgroundConnectionStatus>('disabled');

  const checkStatus = useCallback(async (): Promise<BackgroundConnectionStatus> => {
    if (!enableUserNotifications) {
      return 'disabled';
    }

    const healthStatus = await getCurrentBackgroundStatus();
    return deriveStatus(healthStatus?.state === 'Open', healthStatus);
  }, [enableUserNotifications]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    /**
     * Check the status, publish it and schedule the next check. Never rejects: it is fired from
     * the effect, listeners and setTimeout, none of which handle a rejection. A failed check is
     * logged and ends polling until the next foreground or status event.
     */
    const poll = async () => {
      let next: BackgroundConnectionStatus;
      try {
        next = await checkStatus();
      } catch (error) {
        logger.error('Failed to check background connection status', error);
        return;
      }
      if (cancelled) {
        return;
      }
      setStatus(next);
      const delay =
        next === 'connected' || next === 'disabled' ? appConfig.fgsWorkerHealthTimer : FAST_POLL_INTERVAL_MS;
      timeoutId = setTimeout(poll, delay);
    };
    void poll();

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        clearTimeout(timeoutId);
        void poll();
      }
    };
    const subscription = AppState.addEventListener('change', onAppStateChange);
    // Android only (iOS never emits), so an update lands without waiting for the next poll.
    const statusSubscription = NativeTricordarrModule.onBackgroundStatusChanged(() => {
      clearTimeout(timeoutId);
      void poll();
    });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      subscription.remove();
      statusSubscription.remove();
    };
  }, [checkStatus, appConfig.fgsWorkerHealthTimer]);

  return status;
};
