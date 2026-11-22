import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import useDateTime from '#src/Libraries/DateTime';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

/**
 * Whether any timezone warning should be shown (Today card, header, etc.).
 *
 * - Pre-registration: never show (server/time not yet established).
 * - Show when the device timezone offset differs from the server, or when the
 *   developer option "Force Show Timezone Warning" is on.
 * - Never show when the user has enabled "Silence Timezone Warnings".
 * - Hide while `now` is before the "dismiss for today" snooze deadline.
 */
function shouldShowTimezoneWarning(params: {
  preRegistrationMode: boolean;
  deviceOffsetMismatch: boolean;
  forceShowTimezoneWarning: boolean;
  silenceTimezoneWarnings: boolean;
  snoozeUntil?: number;
  now: number;
}): boolean {
  return (
    !params.preRegistrationMode &&
    (params.deviceOffsetMismatch || params.forceShowTimezoneWarning) &&
    !params.silenceTimezoneWarnings &&
    !(params.snoozeUntil !== undefined && params.now < params.snoozeUntil)
  );
}

export interface UseTimeZoneWarningReturn {
  showTimeZoneWarning: boolean;
}

/**
 * Device vs server timezone: .getTimezoneOffset() is in minutes and opposite sign
 * from the server (server "you're -4" vs device "they're +4"), so we flip sign.
 */
export const useTimeZoneWarning = (): UseTimeZoneWarningReturn => {
  const {appConfig} = useConfig();
  const {oobeCompleted} = useOobe();
  const {preRegistrationMode} = usePreRegistration();
  const {data: userNotificationData} = useUserNotificationDataQuery({
    enabled: oobeCompleted && !preRegistrationMode,
  });
  // Re-evaluate every minute so an expired snooze re-shows the warning without a restart.
  const now = useDateTime('minute');
  const deviceTimeOffset = new Date().getTimezoneOffset() * -60;
  const deviceOffsetMismatch = !!userNotificationData && deviceTimeOffset !== userNotificationData.serverTimeOffset;
  const showTimeZoneWarning = shouldShowTimezoneWarning({
    preRegistrationMode,
    deviceOffsetMismatch,
    forceShowTimezoneWarning: appConfig.forceShowTimezoneWarning,
    silenceTimezoneWarnings: appConfig.silenceTimezoneWarnings,
    snoozeUntil: appConfig.timezoneWarningSnoozeUntil,
    now: now.getTime(),
  });
  return {showTimeZoneWarning};
};
