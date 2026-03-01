import {createContext, useContext} from 'react';

interface OobeContextType {
  oobeCompleted: boolean;
  oobeFinish: () => void;
  onboarding: boolean;
  setOnboarding: (value: boolean) => void;
}

export const OobeContext = createContext<OobeContextType>({
  oobeCompleted: false,
  oobeFinish: () => {},
  onboarding: false,
  setOnboarding: () => {},
});

export const useOobe = () => useContext(OobeContext);
