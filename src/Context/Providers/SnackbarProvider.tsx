import React, {PropsWithChildren, useState} from 'react';
import {SnackbarContext} from '#src/Context/Contexts/SnackbarContext';
import {SnackbarPayload} from '#src/Types';

export const SnackbarProvider = ({children}: PropsWithChildren) => {
  const [snackbarPayload, setSnackbarPayload] = useState<SnackbarPayload>();
  return <SnackbarContext.Provider value={{snackbarPayload, setSnackbarPayload}}>{children}</SnackbarContext.Provider>;
};
