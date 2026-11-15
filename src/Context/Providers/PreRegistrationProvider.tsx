import React, {PropsWithChildren, useMemo} from 'react';

import {PreRegistrationContext} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {isServerPreRegistration} from '#src/Libraries/Account';

/**
 * Whether the active session's server is in pre-registration mode.
 */
export const PreRegistrationProvider = ({children}: PropsWithChildren) => {
  const {serverProfile} = useSession();
  const preRegistrationMode = isServerPreRegistration(serverProfile);

  const contextValue = useMemo(
    () => ({
      preRegistrationMode,
    }),
    [preRegistrationMode],
  );

  return <PreRegistrationContext.Provider value={contextValue}>{children}</PreRegistrationContext.Provider>;
};
