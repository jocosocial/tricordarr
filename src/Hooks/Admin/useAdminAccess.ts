import {useMemo} from 'react';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';

/**
 * Minimum privilege required to open an admin screen.
 * `accountmanager` is a UserRole, not an access level; TwitarrTeam and above also qualify.
 */
export type AdminMinAccess = 'accountmanager' | 'twitarrteam' | 'tho' | 'admin';

export interface AdminAccess {
  canOpenAdmin: boolean;
  canManageAnnouncements: boolean;
  canManageThemes: boolean;
  canViewSettings: boolean;
  canEditSettings: boolean;
  canViewRollup: boolean;
  canManageSchedule: boolean;
  canReloadNotifications: boolean;
  canManageRegCodes: boolean;
  canAssignDiscordRegCodes: boolean;
  canManageRoles: boolean;
  canManageAccessLevels: boolean;
  canPromoteTHO: boolean;
  canBulkUser: boolean;
  canReloadTimeZones: boolean;
  canReloadSeeds: boolean;
  canManageHunts: boolean;
  hasMinAccess: (minAccess: AdminMinAccess) => boolean;
}

/**
 * Privilege flags for server-admin UI, matching Swiftarr AdminController and SiteAdminController.
 * TwitarrTeam includes THO and Admin via UserAccessLevel.hasAccess.
 */
export const useAdminAccess = (): AdminAccess => {
  const {hasTwitarrTeam, hasTHO, hasAdmin} = usePrivilege();
  const {hasAccountManager} = useRoles();

  return useMemo(() => {
    const hasMinAccess = (minAccess: AdminMinAccess): boolean => {
      switch (minAccess) {
        case 'accountmanager':
          return hasTwitarrTeam || hasAccountManager;
        case 'twitarrteam':
          return hasTwitarrTeam;
        case 'tho':
          return hasTHO;
        case 'admin':
          return hasAdmin;
      }
    };

    return {
      canOpenAdmin: hasTwitarrTeam || hasAccountManager,
      canManageAnnouncements: hasTwitarrTeam,
      canManageThemes: hasTHO,
      canViewSettings: hasTwitarrTeam,
      canEditSettings: hasAdmin,
      canViewRollup: hasTwitarrTeam,
      canManageSchedule: hasTwitarrTeam,
      canReloadNotifications: hasTwitarrTeam,
      canManageRegCodes: hasTwitarrTeam || hasAccountManager,
      canAssignDiscordRegCodes: hasTwitarrTeam,
      canManageRoles: hasTHO,
      canManageAccessLevels: hasTHO,
      canPromoteTHO: hasAdmin,
      canBulkUser: hasAdmin,
      canReloadTimeZones: hasAdmin,
      canReloadSeeds: hasAdmin,
      canManageHunts: hasTwitarrTeam,
      hasMinAccess,
    };
  }, [hasAccountManager, hasAdmin, hasTHO, hasTwitarrTeam]);
};
