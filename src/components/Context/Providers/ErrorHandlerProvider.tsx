import React, {useState, PropsWithChildren} from 'react';
import {ErrorHandlerContext} from '../Contexts/ErrorHandlerContext';

export const ErrorHandlerProvider = ({children}: PropsWithChildren) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  return (
    <ErrorHandlerContext.Provider value={{errorMessage, setErrorMessage, errorBanner, setErrorBanner}}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};
