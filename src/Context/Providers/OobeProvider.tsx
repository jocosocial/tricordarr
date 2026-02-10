import React, {PropsWithChildren, useCallback, useMemo} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {OobeContext} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {createLogger} from '#src/Libraries/Logger';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';

const logger = createLogger('OobeProvider.tsx');

export const OobeProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const {currentSession, updateSession} = useSession();

  const oobeCompleted = useMemo(() => {
    const completedVersion = currentSession?.oobeCompletedVersion ?? 0;
    return completedVersion === appConfig.oobeExpectedVersion;
  }, [currentSession?.oobeCompletedVersion, appConfig.oobeExpectedVersion]);

  const oobeFinish = useCallback(async () => {
    if (!currentSession) {
      logger.warn('Cannot finish OOBE: no current session');
      return;
    }
    await updateSession(currentSession.sessionID, {
      oobeCompletedVersion: appConfig.oobeExpectedVersion,
    });
    // Set lastSessionID when OOBE completes - this ensures sessions created during
    // OOBE flow don't become the "last active" until onboarding is finished
    await SessionStorage.setLastSessionID(currentSession.sessionID);
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
