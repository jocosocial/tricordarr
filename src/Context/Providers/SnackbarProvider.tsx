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

  // react-native-paper Menu renders its children inside a <Portal>, which re-mounts them
  // at the Portal.Host level via PortalManager. React error boundaries (CriticalErrorProvider)
  // do not catch errors thrown in event handlers, so an onPress that fails inside a portaled
  // menu item would crash without any user-visible recovery. Wrap handlers with snackbarTry
  // to catch those errors and surface them as a snackbar instead.
  const snackbarTry = useCallback(
    (callback: () => void | Promise<void>) => {
      return () => {
        try {
          const result = callback();
          if (result instanceof Promise) {
            result.catch((error: unknown) => {
              const message = error instanceof Error ? error.message : String(error);
              wrappedSetSnackbarPayload({message, messageType: 'error'});
            });
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          wrappedSetSnackbarPayload({message, messageType: 'error'});
        }
      };
    },
    [wrappedSetSnackbarPayload],
  );

  return (
    <SnackbarContext.Provider value={{snackbarPayload, setSnackbarPayload: wrappedSetSnackbarPayload, snackbarTry}}>
      {children}
    </SnackbarContext.Provider>
  );
};
