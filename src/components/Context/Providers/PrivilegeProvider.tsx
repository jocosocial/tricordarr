import React, {useState, PropsWithChildren, useEffect} from 'react';
import {PrivilegeContext} from '../Contexts/PrivilegeContext';
import {PrivilegedUserAccounts} from '../../../libraries/Enums/UserAccessLevel';

/**
 * This provider is used for performing a privileged action as some special user.
 */
export const PrivilegeProvider = ({children}: PropsWithChildren) => {
  const [asModerator, setAsModerator] = useState(false);
  const [asTwitarrTeam, setAsTwitarrTeam] = useState(false);
  const [asTHO, setAsTHO] = useState(false);
  const [asAdmin, setAsAdmin] = useState(false);
  const [asPrivilegedUser, setAsPrivilegedUser] = useState<keyof typeof PrivilegedUserAccounts>();

  useEffect(() => {
    setAsPrivilegedUser(undefined);
    if (asAdmin) {
      setAsPrivilegedUser(PrivilegedUserAccounts.admin);
    }
    if (asTHO) {
      setAsPrivilegedUser(PrivilegedUserAccounts.tho);
    }
    if (asTwitarrTeam) {
      setAsPrivilegedUser(PrivilegedUserAccounts.twitarrteam);
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
      case PrivilegedUserAccounts.tho: {
        setAsTHO(true);
        break;
      }
      case PrivilegedUserAccounts.twitarrteam: {
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
      }}>
      {children}
    </PrivilegeContext.Provider>
  );
};
