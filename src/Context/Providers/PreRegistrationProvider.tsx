import React, {PropsWithChildren, useMemo} from 'react';

import {PreRegistrationContext} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';

export const PreRegistrationProvider = ({children}: PropsWithChildren) => {
  const {currentSession} = useSession();

  const preRegistrationMode = useMemo(() => {
    return currentSession?.preRegistrationMode ?? false;
  }, [currentSession?.preRegistrationMode]);

  const contextValue = useMemo(
    () => ({
      preRegistrationMode,
    }),
    [preRegistrationMode],
  );

  return <PreRegistrationContext.Provider value={contextValue}>{children}</PreRegistrationContext.Provider>;
};
