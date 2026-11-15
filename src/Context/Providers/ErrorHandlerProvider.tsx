import React, {PropsWithChildren, useState} from 'react';

import {ErrorHandlerContext} from '#src/Context/Contexts/ErrorHandlerContext';

export const ErrorHandlerProvider = ({children}: PropsWithChildren) => {
  const [hasUnsavedWork, setHasUnsavedWork] = useState<boolean>(false);

  return (
    <ErrorHandlerContext.Provider
      value={{
        hasUnsavedWork,
        setHasUnsavedWork,
      }}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};
