import {createContext, useContext} from 'react';

export interface ErrorHandlerContextType {
  errorMessage: string;
  setErrorMessage: Function;
  errorBanner: string;
  setErrorBanner: Function;
}

export const ErrorHandlerContext = createContext({} as ErrorHandlerContextType);

export const useErrorHandler = () => useContext(ErrorHandlerContext);
