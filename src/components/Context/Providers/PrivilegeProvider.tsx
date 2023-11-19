import React, {PropsWithChildren, useEffect, useState} from 'react';
import {PrivilegeContext} from '../Contexts/PrivilegeContext';
import {PrivilegedUserAccounts, UserAccessLevel} from '../../../libraries/Enums/UserAccessLevel';
import {useAuth} from '../Contexts/AuthContext';

/**
 * This provider is used for performing a privileged action as some special user.
 */
export const PrivilegeProvider = ({children}: PropsWithChildren) => {
  const [asModerator, setAsModerator] = useState(false);
  const [asTwitarrTeam, setAsTwitarrTeam] = useState(false);
  const [asTHO, setAsTHO] = useState(false);
  const [asAdmin, setAsAdmin] = useState(false);
  const [asPrivilegedUser, setAsPrivilegedUser] = useState<keyof typeof PrivilegedUserAccounts>();
  const [hasModerator, setHasModerator] = useState(false);
  const [hasTwitarrTeam, setHasTwitarrTeam] = useState(false);
  const [hasTHO, setHasTHO] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const {tokenData} = useAuth();
  const accessLevel = tokenData?.accessLevel || UserAccessLevel.unverified;

  useEffect(() => {
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
  }, [accessLevel]);

  useEffect(() => {
    setAsPrivilegedUser(undefined);
    if (asAdmin) {
      setAsPrivilegedUser(PrivilegedUserAccounts.admin);
    }
    if (asTHO) {
      setAsPrivilegedUser(PrivilegedUserAccounts.THO);
    }
    if (asTwitarrTeam) {
      setAsPrivilegedUser(PrivilegedUserAccounts.TwitarrTeam);
    }
    if (asModerator) {
      setAsPrivilegedUser(PrivilegedUserAccounts.moderator);
    }
  }, [asModerator, asTwitarrTeam, asTHO, asAdmin, asPrivilegedUser, setAsPrivilegedUser]);

  const clearPrivileges = () => {
    console.info('Clearing Privileges');
    setAsModerator(false);
    setAsTwitarrTeam(false);
    setAsTHO(false);
    setAsAdmin(false);
  };

  const becomeUser = (user: keyof typeof PrivilegedUserAccounts) => {
    clearPrivileges();
    switch (user) {
      case PrivilegedUserAccounts.admin: {
        setAsAdmin(true);
        break;
      }
      case PrivilegedUserAccounts.THO: {
        setAsTHO(true);
        break;
      }
      case PrivilegedUserAccounts.TwitarrTeam: {
        setAsTwitarrTeam(true);
        break;
      }
      case PrivilegedUserAccounts.moderator: {
        setAsModerator(true);
        break;
      }
    }
  };

  return (
    <PrivilegeContext.Provider
      value={{
        asModerator,
        setAsModerator,
        asTwitarrTeam,
        setAsTwitarrTeam,
        asTHO,
        setAsTHO,
        asAdmin,
        setAsAdmin,
        becomeUser,
        clearPrivileges,
        asPrivilegedUser,
        hasModerator,
        hasTHO,
        hasTwitarrTeam,
        hasVerified,
      }}>
      {children}
    </PrivilegeContext.Provider>
  );
};
