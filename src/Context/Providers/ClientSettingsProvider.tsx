import moment from 'moment-timezone';
import React, {PropsWithChildren, useCallback, useMemo} from 'react';
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
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {createLogger} from '#src/Libraries/Logger';
import {useClientSettingsQuery} from '#src/Queries/Client/ClientQueries';

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

  const maxForumPostImages = hasShutternaut
    ? SHUTTERNAUT_MAX_FORUM_POST_IMAGES
    : (clientSettings?.maxForumPostImages ?? DEFAULT_MAX_FORUM_POST_IMAGES);
  const maxImageSize = clientSettings?.maxImageSize ?? DEFAULT_MAX_IMAGE_SIZE;
  const photostreamUploadRateLimit =
    clientSettings?.photostreamUploadRateLimit ?? DEFAULT_PHOTOSTREAM_UPLOAD_RATE_LIMIT;
  const minAccessLevel = (clientSettings?.minAccessLevel as UserAccessLevel) ?? UserAccessLevel.banned;
  const isAccessRestricted =
    !!clientSettings && minAccessLevel !== UserAccessLevel.banned && !clientSettings.enablePreregistration;

  const updateClientSettings = useCallback(async () => {
    const response = await refetch();
    if (response.data) {
      const dateStr = parseCruiseStartDate(response.data.cruiseStartDate);
      updateAppConfig({
        ...appConfig,
        cruiseLength: response.data.cruiseLengthInDays,
        cruiseStartDateStr: dateStr,
        cruiseStartDate: buildCruiseStartDate(dateStr, response.data.portTimeZoneID),
        portTimeZoneID: response.data.portTimeZoneID,
        schedBaseUrl: parseScheduleUpdateURL(response.data.scheduleUpdateURL),
      });
    }
  }, [appConfig, refetch, updateAppConfig]);

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
