import React, {PropsWithChildren, useCallback} from 'react';

import {ClientSettingsContext} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useClientSettingsQuery} from '#src/Queries/Client/ClientQueries';
import {ClientSettingsData} from '#src/Structs/ControllerStructs';

export const ClientSettingsProvider = ({children}: PropsWithChildren) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {data, refetch} = useClientSettingsQuery({enabled: false});

  const updateClientSettings = useCallback(async () => {
    const response = await refetch();
    console.log('ZZZ', response);
    console.log('ZZZ', response.data);
    if (response.data) {
      updateAppConfig({
        ...appConfig,
        cruiseLength: response.data.cruiseLengthInDays,
        cruiseStartDate: ClientSettingsData.parseCruiseStartDate(response.data.cruiseStartDate),
        portTimeZoneID: response.data.portTimeZoneID,
        schedBaseUrl: ClientSettingsData.parseScheduleUpdateURL(response.data.scheduleUpdateURL),
      });
    }
  }, [appConfig, refetch, updateAppConfig]);

  console.log('WEEEEEE', data);

  return (
    <ClientSettingsContext.Provider
      value={{
        updateClientSettings,
      }}>
      {children}
    </ClientSettingsContext.Provider>
  );
};
