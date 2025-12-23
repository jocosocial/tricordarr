import {createContext, useContext} from 'react';

interface ClientSettingsContextType {
  updateClientSettings: () => Promise<void>;
}

export const ClientSettingsContext = createContext(<ClientSettingsContextType>{});

export const useClientSettings = () => useContext(ClientSettingsContext);
