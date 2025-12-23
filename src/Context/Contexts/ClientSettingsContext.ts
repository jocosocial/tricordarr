import {createContext, useContext} from 'react';

import {ClientSettingsData} from '#src/Structs/ControllerStructs';

interface ClientSettingsContextType {
  updateClientSettings: () => Promise<void>;
  clientSettingsData?: ClientSettingsData;
}

export const ClientSettingsContext = createContext(<ClientSettingsContextType>{});

export const useClientSettings = () => useContext(ClientSettingsContext);
