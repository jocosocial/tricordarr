import moment from 'moment-timezone';
import React, {PropsWithChildren, useCallback, useEffect, useMemo, useRef} from 'react';
import URLParse from 'url-parse';

import {
  ClientSettingsContext,
  DEFAULT_MAX_FORUM_POST_IMAGES,
  DEFAULT_MAX_IMAGE_SIZE,
  DEFAULT_PHOTOSTREAM_UPLOAD_RATE_LIMIT,
  SHUTTERNAUT_MAX_FORUM_POST_IMAGES,
} from '#src/Context/Contexts/ClientSettingsContext';
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

/**
 * Mirrors the server's /client/settings into the active ServerProfile and exposes the
 * server-driven limits. Mounted under SessionScope, so there is one instance per session.
 */
export const ClientSettingsProvider = ({children}: PropsWithChildren) => {
  const {data: clientSettings, refetch} = useClientSettingsQuery();
  const {hasShutternaut} = useRoles();
  const {currentSession, serverProfile, updateServerProfile, freshServerSessionID, clearFreshServerSession} =
    useSession();
  const {setServerSwitchInProgress} = useSwiftarrQueryClient();
  // The clientSettings reference last mirrored into the ServerProfile. See the mirror effect below.
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
      if (settings && currentSession) {
        if (serverProfile?.installationID && serverProfile.installationID !== settings.installationID) {
          logger.warn('Server installationID changed; the server may have been reset.', currentSession.serverUrl);
        }
        await updateServerProfile(currentSession.serverUrl, {
          installationID: settings.installationID,
          cruiseLength: settings.cruiseLengthInDays,
          cruiseStartDateStr: parseCruiseStartDate(settings.cruiseStartDate),
          portTimeZoneID: settings.portTimeZoneID,
          schedBaseUrl: parseScheduleUpdateURL(settings.scheduleUpdateURL),
          canonicalHostnames: settings.canonicalHostnames,
          preRegistrationMode: settings.enablePreregistration,
          // Seeded once. After that the list belongs to the user (Background Connection settings).
          ...(serverProfile?.wifiNetworkNames?.length || !settings.shipWifiSSID
            ? {}
            : {wifiNetworkNames: [settings.shipWifiSSID]}),
        });
      }
    },
    [currentSession, serverProfile, refetch, updateServerProfile],
  );

  // Mirrors the server's cruise fields and pre-registration mode into the ServerProfile whenever the query's data changes: a
  // fetch returning different content, or a re-key (sign-in/out). Keyed on the data reference only,
  // not on updateClientSettings, which changes with every profile update; otherwise any write
  // (including a Developer > Cruise Settings save) would immediately re-mirror over it.
  useEffect(() => {
    if (!clientSettings || clientSettings === mirroredClientSettings.current) {
      return;
    }
    mirroredClientSettings.current = clientSettings;
    updateClientSettings(clientSettings).catch(error => logger.error('Failed to mirror client settings:', error));
  }, [clientSettings, updateClientSettings]);

  // A session that a server switch (or a first sign-in to a new server) just created has only an
  // assumed pre-registration mode until the server's settings arrive. Fetch them fresh, and
  // suppress the generic error Snackbar meanwhile: other mounted queries 401 with "maintenance
  // mode" before this check has resolved. Only a successful fetch ends the suppression early;
  // otherwise SwiftarrQueryClientProvider's grace timer ends it. The ref keeps a re-render from
  // fetching twice.
  const handledFreshSession = useRef<string | null>(null);
  const isFreshSession = !!currentSession && freshServerSessionID === currentSession.sessionID;
  useEffect(() => {
    if (!isFreshSession || !currentSession || handledFreshSession.current === currentSession.sessionID) {
      return;
    }
    handledFreshSession.current = currentSession.sessionID;
    setServerSwitchInProgress(true);
    clearFreshServerSession();
    refetch({cancelRefetch: false})
      .then(async ({data}) => {
        if (!data) {
          logger.warn('No client settings loaded for', currentSession.serverUrl);
          return;
        }
        await updateClientSettings(data);
        setServerSwitchInProgress(false);
      })
      .catch(error => logger.error('Failed to apply client settings after server switch:', error));
  }, [
    isFreshSession,
    currentSession,
    refetch,
    updateClientSettings,
    setServerSwitchInProgress,
    clearFreshServerSession,
  ]);

  const value = useMemo(
    () => ({
      updateClientSettings,
      maxForumPostImages,
      maxImageSize,
      photostreamUploadRateLimit,
      isAccessRestricted,
      minAccessLevel,
    }),
    [
      updateClientSettings,
      maxForumPostImages,
      maxImageSize,
      photostreamUploadRateLimit,
      isAccessRestricted,
      minAccessLevel,
    ],
  );

  return <ClientSettingsContext.Provider value={value}>{children}</ClientSettingsContext.Provider>;
};
