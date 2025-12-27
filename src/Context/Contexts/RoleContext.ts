import {createContext, useContext} from 'react';

import {UserRoleType} from '#src/Enums/UserRoleType';

export interface RoleContextType {
  roles: UserRoleType[];
  hasKaraokeManager: boolean;
  hasShutternautManager: boolean;
  hasShutternaut: boolean;
  hasKaraokeAmbassador: boolean;
  hasPerformerSelfEditor: boolean;
  hasRole: (role: UserRoleType) => boolean;
  refetch: () => Promise<void>;
}

export const RoleContext = createContext<RoleContextType>({
  roles: [],
  hasKaraokeManager: false,
  hasShutternautManager: false,
  hasShutternaut: false,
  hasKaraokeAmbassador: false,
  hasPerformerSelfEditor: false,
  hasRole: () => false,
  refetch: async () => {},
});

export const useRoles = () => useContext(RoleContext);
