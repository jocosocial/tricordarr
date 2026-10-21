import {createContext, useContext} from 'react';

import {UserHeader} from '#src/Structs/ControllerStructs';

export interface UserHeaderContextType {
  contains: (headers: UserHeader[] | undefined, header: UserHeader) => boolean;
}

export const UserHeaderContext = createContext(<UserHeaderContextType>{});

/**
 * Pure helpers for UserHeader collections. Provided as a context (rather than a plain
 * hook) so consumers get stable function references across renders - see AppImageContext.ts
 * for the full rationale.
 */
export const useUserHeader = () => useContext(UserHeaderContext);
