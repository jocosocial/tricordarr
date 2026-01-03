import {createContext, useContext} from 'react';

interface OobeContextType {
  oobeCompleted: boolean;
}

export const OobeContext = createContext<OobeContextType>({
  oobeCompleted: false,
});

export const useOobe = () => useContext(OobeContext);

