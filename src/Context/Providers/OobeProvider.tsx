import React, {PropsWithChildren, useMemo} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {OobeContext} from '#src/Context/Contexts/OobeContext';

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
