import React, {PropsWithChildren} from 'react';
import URLParse from 'url-parse';

import {ClientSettingsContext} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useClientSettingsQuery} from '#src/Queries/Client/ClientQueries';

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

export const ClientSettingsProvider = ({children}: PropsWithChildren) => {
  const {data: clientSettingsData, refetch} = useClientSettingsQuery({enabled: false});
  const {appConfig, updateAppConfig} = useConfig();

  const updateClientSettings = async () => {
    await refetch();
    if (!clientSettingsData) {
      console.warn('[ClientSettingsProvider.tsx] No client settings data.');
      return;
    }
    updateAppConfig({
      ...appConfig,
      cruiseLength: clientSettingsData.cruiseLengthInDays,
      cruiseStartDate: new Date(clientSettingsData.cruiseStartDate),
      portTimeZoneID: clientSettingsData.portTimeZoneID,
      schedBaseUrl: parseScheduleUpdateUrl(clientSettingsData.scheduleUpdateURL),
    });
  };

  return (
    <ClientSettingsContext.Provider
      value={{
        clientSettingsData,
        updateClientSettings,
      }}>
      {children}
    </ClientSettingsContext.Provider>
  );
};
