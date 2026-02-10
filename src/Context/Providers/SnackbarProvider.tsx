import React, {PropsWithChildren, SetStateAction, useCallback, useState} from 'react';

import {SnackbarContext} from '#src/Context/Contexts/SnackbarContext';
import {createLogger} from '#src/Libraries/Logger';
import {SnackbarPayload} from '#src/Types';

const logger = createLogger('SnackbarProvider.tsx');

function logPayloadIfPresent(payload: SnackbarPayload): void {
  const level = payload.messageType === 'error' ? 'error' : payload.messageType === 'secret' ? 'debug' : 'info';
  const message = payload.message ?? '';
  logger[level]('Snackbar: ' + message, payload.messageType);
}

export const SnackbarProvider = ({children}: PropsWithChildren) => {
  const [snackbarPayload, setSnackbarPayload] = useState<SnackbarPayload>();

  const wrappedSetSnackbarPayload = useCallback((action: SetStateAction<SnackbarPayload | undefined>) => {
    if (typeof action === 'function') {
      setSnackbarPayload(prev => {
        const next = action(prev);
        if (next && typeof next === 'object') {
          logPayloadIfPresent(next);
        }
        return next;
      });
    } else {
      if (action && typeof action === 'object') {
        logPayloadIfPresent(action);
      }
      setSnackbarPayload(action);
    }
  }, []);

  return (
    <SnackbarContext.Provider value={{snackbarPayload, setSnackbarPayload: wrappedSetSnackbarPayload}}>
      {children}
    </SnackbarContext.Provider>
  );
};
