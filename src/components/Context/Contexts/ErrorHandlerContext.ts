import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {StringOrError} from '../../../libraries/Types';

export interface ErrorHandlerContextType {
  errorMessage?: string;
  setErrorMessage: (e: StringOrError) => void;
  errorBanner?: string;
  setErrorBanner: (e: StringOrError) => void;
  infoMessage?: string;
  setInfoMessage: Dispatch<SetStateAction<string | undefined>>;
}

export const ErrorHandlerContext = createContext({} as ErrorHandlerContextType);

export const useErrorHandler = () => useContext(ErrorHandlerContext);
