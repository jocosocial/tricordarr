import React, {PropsWithChildren, useEffect, useMemo, useState} from 'react';

import {PrivilegeContext} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';

/**
 * This provider determines what privileges the current user has based on their access level.
 */
export const PrivilegeProvider = ({children}: PropsWithChildren) => {
  const [hasModerator, setHasModerator] = useState(false);
  const [hasTwitarrTeam, setHasTwitarrTeam] = useState(false);
  const [hasTHO, setHasTHO] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);
  const {currentSession} = useSession();
  const tokenData = currentSession?.tokenData || null;
  const accessLevel = tokenData?.accessLevel || UserAccessLevel.unverified;
  // Maybe these should come from SwiftarrClientConfig some day?
  const privilegedUsernames = ['admin', 'twitarrteam', 'tho', 'moderator'];

  useEffect(() => {
    clearLevels();
    if (UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.twitarrteam)) {
      setHasTwitarrTeam(true);
    }
    if (UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.moderator)) {
      setHasModerator(true);
    }
    if (UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.tho)) {
      setHasTHO(true);
    }
    if (UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.verified)) {
      setHasVerified(true);
    }
    if (UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.admin)) {
      setHasAdmin(true);
    }
  }, [accessLevel, tokenData]);

  const clearLevels = () => {
    setHasModerator(false);
    setHasTwitarrTeam(false);
    setHasTHO(false);
    setHasVerified(false);
    setHasAdmin(false);
  };

  const hasAnyPrivilege = useMemo(() => {
    return hasModerator || hasTwitarrTeam || hasTHO || hasAdmin;
  }, [hasModerator, hasTwitarrTeam, hasTHO, hasAdmin]);

  return (
    <PrivilegeContext.Provider
      value={{
        hasModerator,
        hasTHO,
        hasTwitarrTeam,
        hasVerified,
        hasAdmin,
        privilegedUsernames,
        hasAnyPrivilege,
      }}>
      {children}
    </PrivilegeContext.Provider>
  );
};
