import {createContext, useContext} from 'react';

export interface PrivilegeContextType {
  hasModerator: boolean;
  hasTwitarrTeam: boolean;
  hasTHO: boolean;
  hasVerified: boolean;
  hasAdmin: boolean;
  privilegedUsernames: string[];
  hasAnyPrivilege: boolean;
}

export const PrivilegeContext = createContext(<PrivilegeContextType>{});

export const usePrivilege = () => useContext(PrivilegeContext);
