import React, {createContext, PropsWithChildren} from 'react';
import {useIsRestoring} from '@tanstack/react-query';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';

export const LoadingProvider = ({children}: PropsWithChildren) => {
  const isRestoring = useIsRestoring();
  const Context = createContext({});

  if (isRestoring) {
    console.log('[LoadingProvider.tsx] Please hold, restoring query cache.');
    return <LoadingView />;
  }

  return <Context.Provider value={{}}>{children}</Context.Provider>;
};
