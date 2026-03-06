import {useIsRestoring} from '@tanstack/react-query';
import React, {createContext, PropsWithChildren} from 'react';

import {AppLoadingScreen} from '#src/Components/Views/Static/AppLoadingScreen';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('LoadingProvider.tsx');

export const LoadingProvider = ({children}: PropsWithChildren) => {
  const isRestoring = useIsRestoring();
  const Context = createContext({});

  if (isRestoring) {
    logger.info('Please hold, restoring query cache.');
    return <AppLoadingScreen />;
  }

  return <Context.Provider value={{}}>{children}</Context.Provider>;
};
