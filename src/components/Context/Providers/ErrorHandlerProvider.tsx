import React, {useState} from 'react';
import {DefaultProviderProps} from './ProviderTypes';
import {ErrorHandlerContext} from '../Contexts/ErrorHandlerContext';

export const ErrorHandlerProvider = ({children}: DefaultProviderProps) => {
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <ErrorHandlerContext.Provider value={{errorMessage, setErrorMessage}}>{children}</ErrorHandlerContext.Provider>
  );
};
