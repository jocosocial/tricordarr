import {useMemo} from 'react';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';

/**
 * Minimum privilege required to open an admin screen.
 * Role-gated features (Account Manager, Hunt Manager) live outside Server Admin and check their
 * role directly, so every level here is a plain UserAccessLevel.
 */
export type AdminMinAccess = 'twitarrteam' | 'tho' | 'admin';

export interface AdminAccess {
  canManageAnnouncements: boolean;
  canManageThemes: boolean;
  canViewSettings: boolean;
  canEditSettings: boolean;
  canViewRollup: boolean;
  canManageSchedule: boolean;
  canReloadNotifications: boolean;
  canAssignDiscordRegCodes: boolean;
  canManageRoles: boolean;
  canManageAccessLevels: boolean;
  canPromoteTHO: boolean;
  canBulkUser: boolean;
  canReloadTimeZones: boolean;
  canReloadSeeds: boolean;
  hasMinAccess: (minAccess: AdminMinAccess) => boolean;
}

/**
 * Privilege flags for server-admin UI, matching Swiftarr AdminController and SiteAdminController.
 * TwitarrTeam includes THO and Admin via UserAccessLevel.hasAccess.
 */
export const useAdminAccess = (): AdminAccess => {
  const {hasTwitarrTeam, hasTHO, hasAdmin} = usePrivilege();

  return useMemo(() => {
    const hasMinAccess = (minAccess: AdminMinAccess): boolean => {
      switch (minAccess) {
        case 'twitarrteam':
          return hasTwitarrTeam;
        case 'tho':
          return hasTHO;
        case 'admin':
          return hasAdmin;
      }
    };

    return {
      canManageAnnouncements: hasTwitarrTeam,
      canManageThemes: hasTHO,
      canViewSettings: hasTwitarrTeam,
      canEditSettings: hasAdmin,
      canViewRollup: hasTwitarrTeam,
      canManageSchedule: hasTwitarrTeam,
      canReloadNotifications: hasTwitarrTeam,
      canAssignDiscordRegCodes: hasTwitarrTeam,
      canManageRoles: hasTHO,
      canManageAccessLevels: hasTHO,
      canPromoteTHO: hasAdmin,
      canBulkUser: hasAdmin,
      canReloadTimeZones: hasAdmin,
      canReloadSeeds: hasAdmin,
      hasMinAccess,
    };
  }, [hasAdmin, hasTHO, hasTwitarrTeam]);
};
