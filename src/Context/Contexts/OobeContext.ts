import {createContext, useContext} from 'react';

interface OobeContextType {
  oobeCompleted: boolean;
  oobeFinish: () => void;
}

export const OobeContext = createContext<OobeContextType>({
  oobeCompleted: false,
  oobeFinish: () => {},
});

export const useOobe = () => useContext(OobeContext);
