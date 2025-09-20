import React, {PropsWithChildren, useState} from 'react';
import {SnackbarContext} from '#src/Context/Contexts/SnackbarContext.ts';
import {SnackbarPayload} from '../../../Libraries/Types/index.ts';

export const SnackbarProvider = ({children}: PropsWithChildren) => {
  const [snackbarPayload, setSnackbarPayload] = useState<SnackbarPayload>();
  return <SnackbarContext.Provider value={{snackbarPayload, setSnackbarPayload}}>{children}</SnackbarContext.Provider>;
};
