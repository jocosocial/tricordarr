import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

/**
 * Whether any timezone warning should be shown (Today card, header, etc.).
 *
 * - Pre-registration: never show (server/time not yet established).
 * - Show when the device timezone offset differs from the server, or when the
 *   developer option "Force Show Timezone Warning" is on.
 * - Never show when the user has enabled "Silence Timezone Warnings".
 */
function shouldShowTimezoneWarning(params: {
  preRegistrationMode: boolean;
  deviceOffsetMismatch: boolean;
  forceShowTimezoneWarning: boolean;
  silenceTimezoneWarnings: boolean;
}): boolean {
  return (
    !params.preRegistrationMode &&
    (params.deviceOffsetMismatch || params.forceShowTimezoneWarning) &&
    !params.silenceTimezoneWarnings
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
  const deviceTimeOffset = new Date().getTimezoneOffset() * -60;
  const deviceOffsetMismatch = !!userNotificationData && deviceTimeOffset !== userNotificationData.serverTimeOffset;
  const showTimeZoneWarning = shouldShowTimezoneWarning({
    preRegistrationMode,
    deviceOffsetMismatch,
    forceShowTimezoneWarning: appConfig.forceShowTimezoneWarning,
    silenceTimezoneWarnings: appConfig.silenceTimezoneWarnings,
  });
  return {showTimeZoneWarning};
};
