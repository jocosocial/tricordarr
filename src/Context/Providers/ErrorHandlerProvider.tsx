import React, {PropsWithChildren, useCallback, useState} from 'react';

import {ErrorHandlerContext} from '#src/Context/Contexts/ErrorHandlerContext';
import {createLogger} from '#src/Libraries/Logger';
import {StringOrError} from '#src/Types';

const logger = createLogger('ErrorHandlerProvider.tsx');

// https://stackoverflow.com/questions/30469261/checking-for-typeof-error-in-js
function getErrorMessage(e: StringOrError) {
  if (typeof e === 'object' && e.message) {
    return e.message;
  } else if (typeof e === 'string') {
    return e;
  } else if (typeof e === 'undefined') {
    return undefined;
  }
  logger.error('Unable to determine error type!', e);
  return 'Unknown Error!';
}

export const ErrorHandlerProvider = ({children}: PropsWithChildren) => {
  const [errorBanner, setErrorBannerString] = useState<string | undefined>();
  const [hasUnsavedWork, setHasUnsavedWork] = useState<boolean>(false);

  const setErrorBanner = useCallback(
    (e: StringOrError) => setErrorBannerString(getErrorMessage(e)),
    [setErrorBannerString],
  );

  return (
    <ErrorHandlerContext.Provider
      value={{
        errorBanner,
        setErrorBanner,
        hasUnsavedWork,
        setHasUnsavedWork,
      }}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};
