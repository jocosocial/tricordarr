import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';

export interface PrivilegeContextType {
  asModerator: boolean;
  setAsModerator: Dispatch<SetStateAction<boolean>>;
  asTwitarrTeam: boolean;
  setAsTwitarrTeam: Dispatch<SetStateAction<boolean>>;
  asTHO: boolean;
  setAsTHO: Dispatch<SetStateAction<boolean>>;
  asAdmin: boolean;
  setAsAdmin: Dispatch<SetStateAction<boolean>>;
  clearPrivileges: () => void;
  asPrivilegedUser?: keyof typeof PrivilegedUserAccounts;
  becomeUser: (user: keyof typeof PrivilegedUserAccounts) => void;
  hasModerator: boolean;
  hasTwitarrTeam: boolean;
  hasTHO: boolean;
  hasVerified: boolean;
  hasAdmin: boolean;
  privilegedUsernames: string[];
}

export const PrivilegeContext = createContext(<PrivilegeContextType>{});

export const usePrivilege = () => useContext(PrivilegeContext);
