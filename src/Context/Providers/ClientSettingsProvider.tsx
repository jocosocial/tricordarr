import React, {PropsWithChildren, useCallback, useMemo} from 'react';

import {
  ClientSettingsContext,
  DEFAULT_MAX_FORUM_POST_IMAGES,
  DEFAULT_MAX_IMAGE_SIZE,
  DEFAULT_PHOTOSTREAM_UPLOAD_RATE_LIMIT,
  SHUTTERNAUT_MAX_FORUM_POST_IMAGES,
} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useClientSettingsQuery} from '#src/Queries/Client/ClientQueries';
import {ClientSettingsData} from '#src/Structs/ControllerStructs';

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

  const updateClientSettings = useCallback(async () => {
    const response = await refetch();
    if (response.data) {
      const dateStr = ClientSettingsData.parseCruiseStartDate(response.data.cruiseStartDate);
      updateAppConfig({
        ...appConfig,
        cruiseLength: response.data.cruiseLengthInDays,
        cruiseStartDateStr: dateStr,
        cruiseStartDate: ClientSettingsData.buildCruiseStartDate(dateStr, response.data.portTimeZoneID),
        portTimeZoneID: response.data.portTimeZoneID,
        schedBaseUrl: ClientSettingsData.parseScheduleUpdateURL(response.data.scheduleUpdateURL),
      });
    }
  }, [appConfig, refetch, updateAppConfig]);

  const value = useMemo(
    () => ({
      updateClientSettings,
      maxForumPostImages,
      maxImageSize,
      photostreamUploadRateLimit,
    }),
    [updateClientSettings, maxForumPostImages, maxImageSize, photostreamUploadRateLimit],
  );

  return <ClientSettingsContext.Provider value={value}>{children}</ClientSettingsContext.Provider>;
};
