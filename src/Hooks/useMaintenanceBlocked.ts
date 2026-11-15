import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';

/**
 * Endpoints the server keeps answering while in maintenance mode. They are how the app learns
 * (and re-checks) that the server is restricted, so they must never be gated on it.
 */
const MAINTENANCE_EXEMPT_ENDPOINTS = ['/client/health', '/client/settings'];

/**
 * Whether the server's maintenance mode currently blocks the current user (logged out: any
 * restriction; logged in: access level below the server's minimum).
 */
export const useMaintenanceBlocked = () => {
  const {isAccessRestricted, minAccessLevel} = useClientSettings();
  const {isLoggedIn, currentSession} = useSession();
  const userAccessLevel = currentSession?.tokenData?.accessLevel;
  return (
    isAccessRestricted &&
    (isLoggedIn ? !UserAccessLevel.hasAccess(userAccessLevel ?? UserAccessLevel.unverified, minAccessLevel) : true)
  );
};

/**
 * Whether a query to this endpoint should be held back because the server is in maintenance mode
 * for the current user. The server 401s everything but the exempt endpoints in that state.
 */
export const useMaintenanceGate = (endpoint: string) => {
  const blocked = useMaintenanceBlocked();
  return blocked && !MAINTENANCE_EXEMPT_ENDPOINTS.includes(endpoint);
};
