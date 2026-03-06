import React, {PropsWithChildren, useCallback, useMemo, useState} from 'react';

import {ElevationContext} from '#src/Context/Contexts/ElevationContext';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';

interface ElevationProviderProps {
  initialElevation?: keyof typeof PrivilegedUserAccounts;
}

/**
 * Provider for per-screen elevation state. This is intended to be used in a Screen
 * rather than globally in the App.tsx since elevation varies by screen context.
 */
export const ElevationProvider = ({children, initialElevation}: PropsWithChildren<ElevationProviderProps>) => {
  const [asPrivilegedUser, setAsPrivilegedUser] = useState<keyof typeof PrivilegedUserAccounts | undefined>(
    initialElevation,
  );

  const becomeUser = useCallback((user: keyof typeof PrivilegedUserAccounts) => {
    setAsPrivilegedUser(user);
  }, []);

  const clearElevation = useCallback(() => {
    setAsPrivilegedUser(undefined);
  }, []);

  const asModerator = useMemo(() => asPrivilegedUser === PrivilegedUserAccounts.moderator, [asPrivilegedUser]);
  const asTwitarrTeam = useMemo(() => asPrivilegedUser === PrivilegedUserAccounts.TwitarrTeam, [asPrivilegedUser]);

  const contextValue = useMemo(
    () => ({asPrivilegedUser, asModerator, asTwitarrTeam, becomeUser, clearElevation}),
    [asPrivilegedUser, asModerator, asTwitarrTeam, becomeUser, clearElevation],
  );

  return <ElevationContext.Provider value={contextValue}>{children}</ElevationContext.Provider>;
};
