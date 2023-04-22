import {createContext, Dispatch, SetStateAction, useContext} from 'react';

export interface PrivilegeContextType {
  asModerator: boolean;
  setAsModerator: Dispatch<SetStateAction<boolean>>;
  asTwitarrTeam: boolean;
  setAsTwitarrTeam: Dispatch<SetStateAction<boolean>>;
  asTHO: boolean;
  setAsTHO: Dispatch<SetStateAction<boolean>>;
  asAdmin: boolean;
  setAsAdmin: Dispatch<SetStateAction<boolean>>;
  asPrivileged: boolean;
}

export const PrivilegeContext = createContext(<PrivilegeContextType>{});

export const usePrivilege = () => useContext(PrivilegeContext);
