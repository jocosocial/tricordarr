import React, {PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {OobeContext} from '#src/Context/Contexts/OobeContext';
import {createLogger} from '#src/Libraries/Logger';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';

const logger = createLogger('OobeProvider.tsx');

/**
 * OOBE completion is device-level (APP_OOBE_COMPLETED_VERSION_V1): a second account on a device
 * that already onboarded does not re-run it. Withholds children until the stored version has been
 * read, like the config and session providers, so the root navigator never picks its initial
 * route from a placeholder.
 */
export const OobeProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [completedVersion, setCompletedVersion] = useState<number>();
  const [resumeAfterCommit, setResumeAfterCommit] = useState(false);

  useEffect(() => {
    SessionStorage.getOobeCompletedVersion()
      .then(setCompletedVersion)
      .catch(error => {
        logger.error('Failed to read OOBE version:', error);
        setCompletedVersion(0);
      });
  }, []);

  const oobeCompleted = (completedVersion ?? 0) >= appConfig.oobeExpectedVersion;

  /**
   * Record OOBE as completed at the expected version (or any version, for the developer reset).
   */
  const setOobeCompletedVersion = useCallback(async (version: number) => {
    setCompletedVersion(version);
    await SessionStorage.setOobeCompletedVersion(version);
  }, []);

  const oobeFinish = useCallback(async () => {
    await setOobeCompletedVersion(appConfig.oobeExpectedVersion);
    setResumeAfterCommit(false);
    // @TODO remove this after 2026. This is here because the decision to start with thumbs
    // happened after preregistration opened so a ton of people have the original default
    // of skipping thumbnails.
    // @TODO: I changed my mind at the last minute, yolo.
    // updateAppConfig({
    //   ...appConfig,
    //   skipThumbnails: false,
    // });
  }, [appConfig.oobeExpectedVersion, setOobeCompletedVersion]);

  const contextValue = useMemo(
    () => ({
      oobeCompleted,
      oobeCompletedVersion: completedVersion ?? 0,
      oobeFinish,
      setOobeCompletedVersion,
      resumeAfterCommit,
      setResumeAfterCommit,
    }),
    [oobeCompleted, completedVersion, oobeFinish, setOobeCompletedVersion, resumeAfterCommit],
  );

  if (completedVersion === undefined) {
    logger.debug('OOBE state is not ready.');
    return null;
  }

  return <OobeContext.Provider value={contextValue}>{children}</OobeContext.Provider>;
};
