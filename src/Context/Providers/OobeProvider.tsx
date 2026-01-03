import React, {PropsWithChildren, useCallback, useMemo} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {OobeContext} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';

export const OobeProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const {currentSession, updateSession} = useSession();

  const oobeCompleted = useMemo(() => {
    const completedVersion = currentSession?.oobeCompletedVersion ?? 0;
    return completedVersion === appConfig.oobeExpectedVersion;
  }, [currentSession?.oobeCompletedVersion, appConfig.oobeExpectedVersion]);

  const oobeFinish = useCallback(async () => {
    if (!currentSession) {
      console.warn('[OobeProvider] Cannot finish OOBE: no current session');
      return;
    }
    await updateSession(currentSession.sessionID, {
      oobeCompletedVersion: appConfig.oobeExpectedVersion,
    });
  }, [currentSession, updateSession, appConfig.oobeExpectedVersion]);

  const contextValue = useMemo(
    () => ({
      oobeCompleted,
      oobeFinish,
    }),
    [oobeCompleted, oobeFinish],
  );

  return <OobeContext.Provider value={contextValue}>{children}</OobeContext.Provider>;
};
