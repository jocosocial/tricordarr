import React, {useState, PropsWithChildren, useCallback} from 'react';
import {ErrorHandlerContext} from '../Contexts/ErrorHandlerContext';
import {StringOrError} from '../../../libraries/Types';

// https://stackoverflow.com/questions/30469261/checking-for-typeof-error-in-js
function getErrorMessage(e: StringOrError) {
  if (typeof e === 'object' && e.message) {
    return e.message;
  } else if (typeof e === 'string') {
    return e;
  } else if (typeof e === 'undefined') {
    return undefined;
  }
  console.error('Unable to determine error type!', e);
  return 'Unknown Error!';
}

export const ErrorHandlerProvider = ({children}: PropsWithChildren) => {
  const [errorMessage, setErrorMessageString] = useState<string | undefined>();
  const [errorBanner, setErrorBannerString] = useState<string | undefined>();
  const [infoMessage, setInfoMessage] = useState<string>();
  const [hasUnsavedWork, setHasUnsavedWork] = useState<boolean>(false);

  const setErrorMessage = useCallback(
    (e: StringOrError) => setErrorMessageString(getErrorMessage(e)),
    [setErrorMessageString],
  );
  const setErrorBanner = useCallback(
    (e: StringOrError) => setErrorBannerString(getErrorMessage(e)),
    [setErrorBannerString],
  );

  return (
    <ErrorHandlerContext.Provider
      value={{
        errorMessage,
        setErrorMessage,
        errorBanner,
        setErrorBanner,
        infoMessage,
        setInfoMessage,
        hasUnsavedWork,
        setHasUnsavedWork,
      }}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};
