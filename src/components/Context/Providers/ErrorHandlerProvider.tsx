import React, {useState} from 'react';
import {DefaultProviderProps} from './ProviderTypes';
import {ErrorHandlerContext} from '../Contexts/ErrorHandlerContext';

export const ErrorHandlerProvider = ({children}: DefaultProviderProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  return (
    <ErrorHandlerContext.Provider value={{errorMessage, setErrorMessage, errorBanner, setErrorBanner}}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};
