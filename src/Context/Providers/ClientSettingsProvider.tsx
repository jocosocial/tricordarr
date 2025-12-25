import React, {PropsWithChildren, useCallback} from 'react';
import URLParse from 'url-parse';

import {ClientSettingsContext} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {ClientSettingsData} from '#src/Structs/ControllerStructs';

const parseScheduleUpdateUrl = (url: string): string => {
  try {
    const urlObj = new URLParse(url);
    // protocol includes the colon, so we need to add "//"
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch (error) {
    console.error('[ClientSettingsProvider.tsx] Error parsing URL:', error);
    return url;
  }
};

const parseYMDToLocalDate = (ymd: string): Date => {
  // Prefer local-midnight semantics like the old code path (new Date('YYYY-MM-DD') is UTC and can shift a day).
  const [year, month, day] = ymd.split('-').map(Number);
  if (!year || !month || !day) {
    console.warn('[ClientSettingsProvider.tsx] Unexpected date format for cruiseStartDate:', ymd);
    return new Date(ymd);
  }
  return new Date(year, month - 1, day);
};

export const ClientSettingsProvider = ({children}: PropsWithChildren) => {
  const {disruptionDetected, apiGet, queryKeyExtraData, serverUrl} = useSwiftarrQueryClient();
  const {appConfig, updateAppConfig} = useConfig();

  const updateClientSettings = useCallback(async () => {
    if (disruptionDetected) {
      console.warn('[ClientSettingsProvider.tsx] Skipping updateClientSettings; disruptionDetected is true.');
      return;
    }

    let data: ClientSettingsData;
    try {
      const response = await apiGet<ClientSettingsData, undefined>('/client/settings', undefined);
      data = response.data;
    } catch (error) {
      console.warn(
        '[ClientSettingsProvider.tsx] Failed to fetch client settings from',
        `${serverUrl}${appConfig.urlPrefix}`,
        'queryKeyExtraData=',
        queryKeyExtraData,
        error,
      );
      return;
    }

    updateAppConfig({
      ...appConfig,
      cruiseLength: data.cruiseLengthInDays,
      cruiseStartDate: parseYMDToLocalDate(data.cruiseStartDate),
      portTimeZoneID: data.portTimeZoneID,
      schedBaseUrl: parseScheduleUpdateUrl(data.scheduleUpdateURL),
    });
  }, [apiGet, appConfig, disruptionDetected, queryKeyExtraData, serverUrl, updateAppConfig]);

  return (
    <ClientSettingsContext.Provider
      value={{
        updateClientSettings,
      }}>
      {children}
    </ClientSettingsContext.Provider>
  );
};
