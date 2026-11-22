import moment from 'moment-timezone';
import {useCallback} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {alertDismissTimezoneWarning} from '#src/Libraries/Alerts/SettingsAlerts';

/**
 * Returns a callback that asks the user whether to dismiss the time zone warning for today or
 * permanently, and persists the choice. Shared by every place the warning can be dismissed.
 *
 * "Today" ends at the end of the current ship day, computed in the ship's time zone (not the
 * device's, which may be the very thing that is wrong). When the late day flip is enabled the
 * day rolls over at 03:00 ship time, matching TimeProvider.getAdjustedMoment.
 *
 * @param callbacks Optional hooks run after the config is updated, for callers that mirror it in local state.
 */
export const useDismissTimezoneWarning = (callbacks?: {onToday?: () => void; onPermanent?: () => void}) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {tzAtTime} = useTimeZone();
  const enableLateDayFlip = appConfig.schedule.enableLateDayFlip;

  /**
   * Epoch milliseconds of the end of the current ship day.
   */
  const getEndOfShipDay = useCallback((): number => {
    const now = new Date();
    const m = moment(now).tz(tzAtTime(now));
    if (enableLateDayFlip) {
      m.subtract(3, 'hours');
    }
    m.endOf('day');
    if (enableLateDayFlip) {
      m.add(3, 'hours');
    }
    return m.valueOf();
  }, [enableLateDayFlip, tzAtTime]);

  return useCallback(
    () =>
      alertDismissTimezoneWarning(
        () => {
          updateAppConfig({
            ...appConfig,
            timezoneWarningSnoozeUntil: getEndOfShipDay(),
            forceShowTimezoneWarning: false,
          });
          callbacks?.onToday?.();
        },
        () => {
          updateAppConfig({
            ...appConfig,
            silenceTimezoneWarnings: true,
            forceShowTimezoneWarning: false,
            timezoneWarningSnoozeUntil: undefined,
          });
          callbacks?.onPermanent?.();
        },
      ),
    [appConfig, callbacks, getEndOfShipDay, updateAppConfig],
  );
};
