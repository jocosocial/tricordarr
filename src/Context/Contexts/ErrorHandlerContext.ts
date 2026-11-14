import {createContext, Dispatch, SetStateAction, useContext} from 'react';

export interface ErrorHandlerContextType {
  hasUnsavedWork: boolean;
  setHasUnsavedWork: Dispatch<SetStateAction<boolean>>;
}

export const ErrorHandlerContext = createContext({} as ErrorHandlerContextType);

export const useErrorHandler = () => useContext(ErrorHandlerContext);
