import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {StringOrError} from '../../../libraries/Types';

export interface ErrorHandlerContextType {
  errorBanner?: string;
  setErrorBanner: (e: StringOrError) => void;
  hasUnsavedWork: boolean;
  setHasUnsavedWork: Dispatch<SetStateAction<boolean>>;
}

export const ErrorHandlerContext = createContext({} as ErrorHandlerContextType);

export const useErrorHandler = () => useContext(ErrorHandlerContext);
