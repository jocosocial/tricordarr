import React, {useState, PropsWithChildren} from 'react';
import {ErrorHandlerContext} from '../Contexts/ErrorHandlerContext';
import {StringOrError} from '../../../libraries/Types';

// https://stackoverflow.com/questions/30469261/checking-for-typeof-error-in-js
function getErrorMessage(e: StringOrError) {
  if (typeof e === 'object' && e.message) {
    return e.message;
  } else if (typeof e === 'string') {
    return e;
  }
  console.error('Unable to determine error type!', e);
  return 'Unknown Error!';
}

export const ErrorHandlerProvider = ({children}: PropsWithChildren) => {
  const [errorMessage, setErrorMessageString] = useState('');
  const [errorBanner, setErrorBannerString] = useState('');

  const setErrorMessage = (e: StringOrError) => setErrorMessageString(getErrorMessage(e));
  const setErrorBanner = (e: StringOrError) => setErrorBannerString(getErrorMessage(e));

  return (
    <ErrorHandlerContext.Provider value={{errorMessage, setErrorMessage, errorBanner, setErrorBanner}}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};
