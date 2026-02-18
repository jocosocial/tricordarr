import React, {PropsWithChildren, useCallback} from 'react';

import {ClientSettingsContext} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useClientSettingsQuery} from '#src/Queries/Client/ClientQueries';
import {ClientSettingsData} from '#src/Structs/ControllerStructs';

export const ClientSettingsProvider = ({children}: PropsWithChildren) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {refetch} = useClientSettingsQuery({enabled: false});

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

  return (
    <ClientSettingsContext.Provider
      value={{
        updateClientSettings,
      }}>
      {children}
    </ClientSettingsContext.Provider>
  );
};
