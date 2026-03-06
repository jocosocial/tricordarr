import {createContext, useContext} from 'react';

import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';

export interface ElevationContextType {
  asPrivilegedUser?: keyof typeof PrivilegedUserAccounts;
  asModerator: boolean;
  asTwitarrTeam: boolean;
  becomeUser: (user: keyof typeof PrivilegedUserAccounts) => void;
  clearElevation: () => void;
}

export const ElevationContext = createContext(<ElevationContextType>{
  asPrivilegedUser: undefined,
  asModerator: false,
  asTwitarrTeam: false,
  becomeUser: () => {},
  clearElevation: () => {},
});

export const useElevation = () => useContext(ElevationContext);
