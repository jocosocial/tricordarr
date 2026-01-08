import React, {PropsWithChildren, useEffect, useMemo, useState} from 'react';

import {RoleContext} from '#src/Context/Contexts/RoleContext';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {useUserWhoamiQuery} from '#src/Queries/User/UserQueries';

/**
 * This provider manages the current user's roles from the whoami query.
 */
export const RoleProvider = ({children}: PropsWithChildren) => {
  const {data: whoamiData, refetch: refetchWhoami} = useUserWhoamiQuery();
  const [roles, setRoles] = useState<UserRoleType[]>([]);
  const [hasKaraokeManager, setHasKaraokeManager] = useState(false);
  const [hasShutternautManager, setHasShutternautManager] = useState(false);
  const [hasShutternaut, setHasShutternaut] = useState(false);
  const [hasKaraokeAmbassador, setHasKaraokeAmbassador] = useState(false);
  const [hasPerformerSelfEditor, setHasPerformerSelfEditor] = useState(false);

  useEffect(() => {
    const userRoles = whoamiData?.roles || [];
    setRoles(userRoles);
    setHasKaraokeManager(userRoles.includes(UserRoleType.karaokemanager));
    setHasShutternautManager(userRoles.includes(UserRoleType.shutternautmanager));
    setHasShutternaut(userRoles.includes(UserRoleType.shutternaut));
    setHasKaraokeAmbassador(userRoles.includes(UserRoleType.karaokeambassador));
    setHasPerformerSelfEditor(userRoles.includes(UserRoleType.performerselfeditor));
  }, [whoamiData]);

  const hasRole = useMemo(() => (role: UserRoleType) => roles.includes(role), [roles]);

  const refetch = useMemo(
    () => async () => {
      await refetchWhoami();
    },
    [refetchWhoami],
  );

  return (
    <RoleContext.Provider
      value={{
        roles,
        hasKaraokeManager,
        hasShutternautManager,
        hasShutternaut,
        hasKaraokeAmbassador,
        hasPerformerSelfEditor,
        hasRole,
        refetch,
      }}>
      {children}
    </RoleContext.Provider>
  );
};
