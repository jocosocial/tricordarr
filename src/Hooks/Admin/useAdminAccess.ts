import {useMemo} from 'react';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';

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
}

/**
 * Per-capability privilege flags for the Server Admin UI, matching Swiftarr's AdminController and
 * SiteAdminController. Screen-level checkpoints read `usePrivilege` directly; this hook is for the
 * finer-grained "can this user do X" questions within a screen.
 * TwitarrTeam includes THO and Admin via UserAccessLevel.hasAccess.
 */
export const useAdminAccess = (): AdminAccess => {
  const {hasTwitarrTeam, hasTHO, hasAdmin} = usePrivilege();

  return useMemo(() => {
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
    };
  }, [hasAdmin, hasTHO, hasTwitarrTeam]);
};
