import {createContext, useContext} from 'react';

interface PreRegistrationContextType {
  preRegistrationMode: boolean;
}

export const PreRegistrationContext = createContext<PreRegistrationContextType>({
  preRegistrationMode: false,
});

export const usePreRegistration = () => useContext(PreRegistrationContext);
