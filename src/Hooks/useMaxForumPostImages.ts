import {useMemo} from 'react';

import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useClientSettingsQuery} from '#src/Queries/Client/ClientQueries';

/**
 * Hook that returns the maximum number of images allowed for forum posts
 * based on the user's role and server settings.
 *
 * - Shutternauts can upload up to 8 images
 * - Regular users are limited by the `maxForumPostImages` server setting (default: 4)
 *
 * @returns The maximum number of images allowed for forum posts
 */
export const useMaxForumPostImages = (): number => {
  const {hasShutternaut} = useRoles();
  const {data: clientSettings} = useClientSettingsQuery();

  return useMemo(() => {
    // Shutternauts get 8 images
    if (hasShutternaut) {
      return 8;
    }

    // Regular users get maxForumPostImages from server settings, fallback to 4
    return clientSettings?.maxForumPostImages ?? 4;
  }, [hasShutternaut, clientSettings?.maxForumPostImages]);
};
