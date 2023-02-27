import {createContext, Dispatch, SetStateAction, useContext} from 'react';

export interface ErrorHandlerContextType {
  errorMessage: string;
  setErrorMessage: Dispatch<SetStateAction<string>>;
}

export const ErrorHandlerContext = createContext({} as ErrorHandlerContextType);

export const useErrorHandler = () => useContext(ErrorHandlerContext);
