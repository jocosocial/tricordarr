import React, {PropsWithChildren, useMemo} from 'react';

import {OobeContext} from '#src/Context/Contexts/OobeContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';

export const OobeProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();

  const oobeCompleted = useMemo(() => {
    return appConfig.oobeCompletedVersion === appConfig.oobeExpectedVersion;
  }, [appConfig.oobeCompletedVersion, appConfig.oobeExpectedVersion]);

  const contextValue = useMemo(
    () => ({
      oobeCompleted,
    }),
    [oobeCompleted],
  );

  return <OobeContext.Provider value={contextValue}>{children}</OobeContext.Provider>;
};

