import React, {useState, PropsWithChildren, useEffect} from 'react';
import {PrivilegeContext} from '../Contexts/PrivilegeContext';

/**
 * This provider is used for performing a privileged action as some special user.
 * It is not for determining if you are privileged or not. This is intentionally
 * not included in App.tsx with all the other providers. It is recommended to be
 * a child of <AppView> in a particular screen for whatever action is about to
 * be privileged.
 */
export const PrivilegeProvider = ({children}: PropsWithChildren) => {
  const [asModerator, setAsModerator] = useState(false);
  const [asTwitarrTeam, setAsTwitarrTeam] = useState(false);
  const [asTHO, setAsTHO] = useState(false);
  const [asAdmin, setAsAdmin] = useState(false);
  const [asPrivileged, setAsPrivileged] = useState(false);

  useEffect(() => {
    setAsPrivileged(asModerator || asTwitarrTeam || asTHO || asAdmin);
  }, [asModerator, asTwitarrTeam, asTHO, asAdmin]);

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
        asPrivileged,
      }}>
      {children}
    </PrivilegeContext.Provider>
  );
};
