import React, {PropsWithChildren, useCallback, useMemo, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {OobeContext} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('OobeProvider.tsx');

export const OobeProvider = ({children}: PropsWithChildren) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {currentSession, updateSession} = useSession();
  const [onboarding, setOnboarding] = useState(false);

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
    setOnboarding(false);
    // @TODO remove this after 2026. This is here because the decision to start with thumbs
    // happened after preregistration opened so a ton of people have the original default
    // of skipping thumbnails.
    updateAppConfig({
      ...appConfig,
      skipThumbnails: false,
    });
    // The persist effect handles writing lastSessionID based on currentSessionID
  }, [currentSession, updateSession, appConfig, updateAppConfig]);

  const contextValue = useMemo(
    () => ({
      oobeCompleted,
      oobeFinish,
      onboarding,
      setOnboarding,
    }),
    [oobeCompleted, oobeFinish, onboarding],
  );

  return <OobeContext.Provider value={contextValue}>{children}</OobeContext.Provider>;
};
