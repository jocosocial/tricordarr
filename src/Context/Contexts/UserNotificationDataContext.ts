import {createContext, useContext} from 'react';

import {FezData, UserNotificationData} from '#src/Structs/ControllerStructs';

export interface UserNotificationDataContextType {
  totalNewCount: (data?: UserNotificationData) => number;
  totalNewSeamail: (data?: UserNotificationData) => number;
  totalNewLFG: (data?: UserNotificationData) => number;
  totalNewPrivateEvent: (data?: UserNotificationData) => number;
  isAddedTo: (data: UserNotificationData | undefined, fez: FezData) => boolean;
}

export const UserNotificationDataContext = createContext(<UserNotificationDataContextType>{});

/**
 * Pure derivation helpers over UserNotificationData (badge counts, "added to" checks).
 * Distinct from EnableUserNotificationContext (the push-notification enable/disable
 * toggle) and useUserNotificationDataQuery (the react-query hook that fetches the raw
 * data these functions operate on). Provided as a context (rather than a plain hook) so
 * consumers get stable function references across renders - see AppImageContext.ts for
 * the full rationale.
 */
export const useUserNotificationData = () => useContext(UserNotificationDataContext);
