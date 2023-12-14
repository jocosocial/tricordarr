import {createContext, Dispatch, SetStateAction, useContext} from 'react';

interface SwiftarrQueryClientContextType {
  errorCount: number;
  setErrorCount: Dispatch<SetStateAction<number>>;
}

export const SwiftarrQueryClientContext = createContext(<SwiftarrQueryClientContextType>{});

export const useSwiftarrQueryClient = () => useContext(SwiftarrQueryClientContext);
