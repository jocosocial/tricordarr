import React, {useState, PropsWithChildren, useEffect} from 'react';
import {PrivilegeContext} from '../Contexts/PrivilegeContext';

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
