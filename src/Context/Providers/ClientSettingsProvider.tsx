import moment from 'moment-timezone';
import React, {PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import URLParse from 'url-parse';

import {
  ClientSettingsContext,
  DEFAULT_MAX_FORUM_POST_IMAGES,
  DEFAULT_MAX_IMAGE_SIZE,
  DEFAULT_PHOTOSTREAM_UPLOAD_RATE_LIMIT,
  SHUTTERNAUT_MAX_FORUM_POST_IMAGES,
} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {createLogger} from '#src/Libraries/Logger';
import {useClientSettingsQuery} from '#src/Queries/Client/ClientQueries';
import {ClientSettingsData} from '#src/Structs/ControllerStructs';

const logger = createLogger('ClientSettingsProvider.tsx');

/**
 * Get the base URL from the payload scheduleUpdateURL.
 * Example: https://jococruise2025.sched.com/all.ics -> https://jococruise2025.sched.com
 */
export const parseScheduleUpdateURL = (url: string): string => {
  try {
    const urlObj = new URLParse(url);
    // protocol includes the colon, so we need to add "//"
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch (error) {
    logger.warn('Error parsing URL:', error);
    return url;
  }
};

/**
 * Extract a timezone-invariant date-only string from the server's cruiseStartDate.
 *
 * The server returns an ISO-8601 timestamp (e.g. "2025-03-02T05:00:00.000Z")
 * representing midnight in the port timezone. We extract the UTC calendar date
 * as a "YYYY-MM-DD" string so it survives JSON round-trips and timezone changes.
 */
export const parseCruiseStartDate = (dateString: string): string => {
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) {
    logger.warn('Unexpected date format for cruiseStartDate:', dateString);
    return dateString;
  }
  const y = parsed.getUTCFullYear();
  const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const d = String(parsed.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Build a Date representing midnight in the port timezone for a date-only string.
 *
 * This produces a consistent absolute time regardless of the device's local timezone,
 * preventing day-shift bugs when the device timezone differs from the port timezone.
 */
export const buildCruiseStartDate = (dateStr: string, portTimeZoneID: string): Date => {
  return moment.tz(dateStr, 'YYYY-MM-DD', portTimeZoneID).toDate();
};

export const ClientSettingsProvider = ({children}: PropsWithChildren) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {data: clientSettings, refetch} = useClientSettingsQuery();
  const {hasShutternaut} = useRoles();
  const {currentSession, updateSession} = useSession();
  const {serverUrl, setServerSwitchInProgress} = useSwiftarrQueryClient();
  // The server URL a switch is moving to, pending application of its pre-registration mode. A
  // target URL rather than a boolean: renders between sign-out and the URL change are still keyed
  // to the old server and must not complete the switch.
  const [serverSwitchTarget, setServerSwitchTarget] = useState<string>();
  // The clientSettings reference last mirrored into AppConfig. See the mirror effect below.
  const mirroredClientSettings = useRef<ClientSettingsData | undefined>(undefined);

  const maxForumPostImages = hasShutternaut
    ? SHUTTERNAUT_MAX_FORUM_POST_IMAGES
    : (clientSettings?.maxForumPostImages ?? DEFAULT_MAX_FORUM_POST_IMAGES);
  const maxImageSize = clientSettings?.maxImageSize ?? DEFAULT_MAX_IMAGE_SIZE;
  const photostreamUploadRateLimit =
    clientSettings?.photostreamUploadRateLimit ?? DEFAULT_PHOTOSTREAM_UPLOAD_RATE_LIMIT;
  const minAccessLevel = (clientSettings?.minAccessLevel as UserAccessLevel) ?? UserAccessLevel.banned;
  const isAccessRestricted =
    !!clientSettings && minAccessLevel !== UserAccessLevel.banned && !clientSettings.enablePreregistration;

  const updateClientSettings = useCallback(
    async (data?: ClientSettingsData) => {
      const settings = data ?? (await refetch()).data;
      if (settings) {
        const dateStr = parseCruiseStartDate(settings.cruiseStartDate);
        updateAppConfig({
          ...appConfig,
          cruiseLength: settings.cruiseLengthInDays,
          cruiseStartDateStr: dateStr,
          cruiseStartDate: buildCruiseStartDate(dateStr, settings.portTimeZoneID),
          portTimeZoneID: settings.portTimeZoneID,
          schedBaseUrl: parseScheduleUpdateURL(settings.scheduleUpdateURL),
        });
      }
    },
    [appConfig, refetch, updateAppConfig],
  );

  /**
   * Applies server-driven client settings to app state. The server's enablePreregistration is the
   * source of truth for the session's preRegistrationMode.
   */
  const applyClientSettings = useCallback(
    async (data: ClientSettingsData) => {
      if (currentSession) {
        await updateSession(currentSession.sessionID, {preRegistrationMode: data.enablePreregistration});
      }
      await updateClientSettings(data);
    },
    [currentSession, updateSession, updateClientSettings],
  );

  // Mirrors the server's cruise fields into AppConfig whenever the query's data changes: a fetch
  // returning different content, or a re-key (server switch, sign-in/out, session change). Keyed on
  // the data reference only, not on updateClientSettings, which changes with every AppConfig
  // update; otherwise any AppConfig write (including a Developer > Cruise Settings save) would
  // immediately re-mirror over it.
  useEffect(() => {
    if (!clientSettings || clientSettings === mirroredClientSettings.current) {
      return;
    }
    mirroredClientSettings.current = clientSettings;
    updateClientSettings(clientSettings).catch(error => logger.error('Failed to mirror client settings:', error));
  }, [clientSettings, updateClientSettings]);

  /**
   * Starts a server switch to serverUrl. Suppresses the generic error Snackbar until the new
   * server's client settings are applied.
   */
  const beginServerSwitch = useCallback(
    (url: string) => {
      setServerSwitchTarget(url);
      setServerSwitchInProgress(true);
    },
    [setServerSwitchInProgress],
  );

  /**
   * Abandons a pending server switch and ends the error suppression.
   */
  const cancelServerSwitch = useCallback(() => {
    setServerSwitchTarget(undefined);
    setServerSwitchInProgress(false);
  }, [setServerSwitchInProgress]);

  // Completes a server switch once this provider's query is keyed to the new server. The API client
  // and query keys are React state, so the caller can't fetch the new server's settings itself;
  // the query re-keys on a later render. In a render where serverUrl is the target, refetch() runs
  // against the target's key: the query hook's options effect is declared earlier in this
  // component, so it has already run. cancelRefetch: false joins the fetch the key change already
  // started rather than sending a second request. Pre-registration mode is only ever taken from the
  // server here (and OOBE's Next), never on ordinary data changes, so the developer toggle holds.
  // The target is cleared before awaiting so re-renders can't apply twice.
  // Only a successful apply ends the error suppression early. When the new server didn't answer,
  // its other queries are failing at the same moment and would each raise a Snackbar, so the
  // suppression is left to run out on SwiftarrQueryClientProvider's grace timer instead.
  useEffect(() => {
    if (!serverSwitchTarget || serverUrl !== serverSwitchTarget) {
      return;
    }
    setServerSwitchTarget(undefined);
    refetch({cancelRefetch: false})
      .then(async ({data}) => {
        if (!data) {
          logger.warn('No client settings loaded for', serverSwitchTarget);
          return;
        }
        await applyClientSettings(data);
        setServerSwitchInProgress(false);
      })
      .catch(error => logger.error('Failed to apply client settings after server switch:', error));
  }, [applyClientSettings, refetch, serverSwitchTarget, serverUrl, setServerSwitchInProgress]);

  const value = useMemo(
    () => ({
      updateClientSettings,
      applyClientSettings,
      beginServerSwitch,
      cancelServerSwitch,
      maxForumPostImages,
      maxImageSize,
      photostreamUploadRateLimit,
      isAccessRestricted,
      minAccessLevel,
    }),
    [
      updateClientSettings,
      applyClientSettings,
      beginServerSwitch,
      cancelServerSwitch,
      maxForumPostImages,
      maxImageSize,
      photostreamUploadRateLimit,
      isAccessRestricted,
      minAccessLevel,
    ],
  );

  return <ClientSettingsContext.Provider value={value}>{children}</ClientSettingsContext.Provider>;
};
